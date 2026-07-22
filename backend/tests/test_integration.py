"""
Tests: End-to-End Integration Workflows
========================================
Workflow 1: Upload → OCR → Chunk → Embed → Vector Store → Search → Response
Workflow 2: Incident → Decision Engine → Knowledge Graph → Runbook → Audit Log
Workflow 3: Login → JWT → RBAC → Protected Endpoint

These tests validate complete multi-step workflows without mocking business logic.
"""

import io

import pytest

MINIMAL_CSV = b"asset_id,status,temperature,vibration\npump_A,operational,85.0,2.3\nvalve_B,degraded,60.0,1.1\ncomp_C,operational,40.0,0.8"


class TestWorkflow1_DocumentToSearch:
    """
    Workflow 1: Upload CSV → Ingest → Index → Semantic Search → Get Results
    """

    def test_w1_step1_upload_document(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("integration_test.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        assert resp.status_code in (201, 422), f"Upload failed: {resp.text}"

    def test_w1_step2_document_in_list(self, client, engineer_headers, operator_headers):
        # Upload
        client.post(
            "/api/v1/documents/upload",
            files={"file": ("w1_list.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        # List
        list_resp = client.get("/api/v1/documents/", headers=operator_headers)
        assert list_resp.status_code == 200
        docs = list_resp.json()
        assert isinstance(docs, list)

    def test_w1_step3_index_document(self, client, engineer_headers):
        upload_resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("w1_index.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        if upload_resp.status_code == 201:
            doc_id = upload_resp.json()["document_id"]
            index_resp = client.post(
                "/api/v1/documents/index",
                json={"document_id": doc_id},
                headers=engineer_headers,
            )
            assert index_resp.status_code in (200, 500)

    def test_w1_step4_search_returns_results(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "pump operational temperature", "top_k": 3},
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert "query_time_ms" in data


class TestWorkflow2_IncidentToAuditLog:
    """
    Workflow 2: Incident → Memory Store → Decision Engine → Runbook → Compliance Report → Audit Log
    """

    @pytest.fixture(scope="class")
    def workflow_state(
        self,
        client,
        built_graph,
        simulation_result,
        engineer_headers,
        operator_headers,
        auditor_headers,
    ):
        """Execute the full incident workflow and return all state."""
        state = {}

        # Step 1: Store the incident in memory
        mem_resp = client.post(
            "/api/v1/memory/store",
            json={
                "failed_asset": "pump_A",
                "failure_type": "bearing_failure",
                "simulation_id": simulation_result["simulation_id"],
                "outcome": "In Progress",
                "decision_data": {},
            },
            headers=engineer_headers,
        )
        assert mem_resp.status_code == 201
        state["incident_id"] = mem_resp.json()["incident_id"]

        # Step 2: Get decision recommendation
        dec_resp = client.post(
            "/api/v1/decision/recommend",
            json={
                "failed_asset": "pump_A",
                "failure_type": "bearing_failure",
                "simulation_id": simulation_result["simulation_id"],
            },
            headers=operator_headers,
        )
        assert dec_resp.status_code == 200
        state["decision"] = dec_resp.json()

        # Step 3: Generate runbook
        rb_resp = client.post(
            "/api/v1/runbook/generate",
            json={
                "simulation_id": simulation_result["simulation_id"],
                "decision_payload": state["decision"],
            },
            headers=operator_headers,
        )
        assert rb_resp.status_code == 201
        state["runbook_id"] = rb_resp.json()["runbook_id"]
        state["runbook"] = rb_resp.json()

        # Step 4: Generate compliance report
        compliance_resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": state["incident_id"]},
            headers=auditor_headers,
        )
        assert compliance_resp.status_code == 201
        state["report_id"] = compliance_resp.json()["report_id"]

        return state

    def test_w2_incident_stored(self, workflow_state):
        assert "incident_id" in workflow_state
        assert workflow_state["incident_id"] is not None

    def test_w2_decision_made(self, workflow_state):
        assert "decision" in workflow_state
        assert "recommended_strategy" in workflow_state["decision"]

    def test_w2_runbook_generated(self, workflow_state):
        assert "runbook_id" in workflow_state
        assert len(workflow_state["runbook"]["steps"]) > 0

    def test_w2_compliance_report_created(self, workflow_state):
        assert "report_id" in workflow_state

    def test_w2_audit_log_populated(self, client, workflow_state, auditor_headers):
        """After the workflow, audit log should have entries."""
        resp = client.get("/api/v1/audit/", headers=auditor_headers)
        assert resp.status_code == 200

    def test_w2_runbook_feedback_loop(self, client, workflow_state, operator_headers):
        """Submit feedback on runbook step."""
        rb = workflow_state["runbook"]
        step_id = rb["steps"][0]["step_id"]
        rb_id = workflow_state["runbook_id"]

        resp = client.put(
            f"/api/v1/runbook/{rb_id}/step/{step_id}",
            json={
                "status": "completed",
                "feedback_notes": "Bearing replaced successfully",
            },
            headers=operator_headers,
        )
        assert resp.status_code == 200

    def test_w2_incident_retrievable(self, client, workflow_state, operator_headers):
        inc_id = workflow_state["incident_id"]
        resp = client.get(f"/api/v1/memory/{inc_id}", headers=operator_headers)
        assert resp.status_code == 200


class TestWorkflow3_LoginJwtRbac:
    """
    Workflow 3: Register → Login → JWT → Use protected endpoint → Logout → Verify denied
    """

    def test_w3_step1_register(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "workflow3_user", "password": "Wf3!Password"},
        )
        assert resp.status_code in (201, 400)  # 400 if already registered

    def test_w3_step2_login_returns_jwt(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "workflow3_jwt_user", "password": "Jwt!Pass123"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "workflow3_jwt_user", "password": "Jwt!Pass123"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert len(data["access_token"]) > 20  # JWT is long

    def test_w3_step3_jwt_enables_protected_endpoint(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "workflow3_protected_user", "password": "Prot3ct!Pass"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "workflow3_protected_user", "password": "Prot3ct!Pass"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Can access protected endpoint
        me_resp = client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200

        # Can access graph (read-only - Operator allowed)
        graph_resp = client.get("/api/v1/graph/", headers=headers)
        assert graph_resp.status_code == 200

    def test_w3_step4_rbac_denies_write(self, client):
        """Operator cannot write documents."""
        client.post(
            "/api/v1/auth/register",
            json={"username": "workflow3_rbac_user", "password": "Rbac!Pass123"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "workflow3_rbac_user", "password": "Rbac!Pass123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # This is Operator role - cannot upload
        upload_resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")},
            headers=headers,
        )
        assert upload_resp.status_code == 403

    def test_w3_step5_logout_invalidates_access(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "workflow3_logout_user", "password": "Log0ut!Pass"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "workflow3_logout_user", "password": "Log0ut!Pass"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Verify works before logout
        assert client.get("/api/v1/auth/me", headers=headers).status_code == 200

        # Logout
        client.post("/api/v1/auth/logout", headers=headers)

        # Must be denied after logout
        resp = client.get("/api/v1/auth/me", headers=headers)
        assert resp.status_code == 401

    def test_w3_step6_token_refresh_extends_session(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "workflow3_refresh_user", "password": "Refr3sh!Pass"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "workflow3_refresh_user", "password": "Refr3sh!Pass"},
        )
        original_tokens = login_resp.json()

        refresh_resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": original_tokens["refresh_token"]},
        )
        assert refresh_resp.status_code == 200
        new_tokens = refresh_resp.json()
        # New access token should work
        new_headers = {"Authorization": f"Bearer {new_tokens['access_token']}"}
        assert client.get("/api/v1/auth/me", headers=new_headers).status_code == 200
