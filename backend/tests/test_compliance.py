"""
Tests: Compliance API
======================
Covers compliance report generation, retrieval, export (PDF/DOCX).
"""

import pytest

MEMORY_PAYLOAD = {
    "failed_asset": "valve_B",
    "failure_type": "seal_leak",
    "simulation_id": "",
    "runbook_id": "",
    "decision_data": {"strategy": "replace seal"},
    "outcome": "Resolved",
}


class TestComplianceReport:
    @pytest.fixture(scope="class")
    def incident_id(self, client, engineer_headers):
        """Store a memory incident to use for compliance report generation."""
        resp = client.post(
            "/api/v1/memory/store",
            json=MEMORY_PAYLOAD,
            headers=engineer_headers,
        )
        assert resp.status_code == 201
        return resp.json()["incident_id"]

    def test_generate_report_success(self, client, incident_id, auditor_headers):
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": incident_id},
            headers=auditor_headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "report_id" in data
        assert "incident_summary" in data
        assert "root_cause" in data
        assert "compliance_checklist" in data

    def test_generate_report_nonexistent_incident(self, client, auditor_headers):
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": "nonexistent_inc_xyz"},
            headers=auditor_headers,
        )
        assert resp.status_code == 404

    def test_generate_report_operator_forbidden(self, client, operator_headers):
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": "any_id"},
            headers=operator_headers,
        )
        assert resp.status_code == 403

    def test_generate_report_engineer_forbidden(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": "any_id"},
            headers=engineer_headers,
        )
        assert resp.status_code == 403

    def test_generate_report_unauthenticated(self, client):
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": "any_id"},
        )
        assert resp.status_code in (401, 403)

    def test_generate_report_invalid_payload(self, client, auditor_headers):
        resp = client.post(
            "/api/v1/compliance/report",
            json={},
            headers=auditor_headers,
        )
        assert resp.status_code == 422


class TestComplianceGet:
    @pytest.fixture(scope="class")
    def report_id(self, client, engineer_headers, auditor_headers):
        """Generate a compliance report to retrieve."""
        mem_resp = client.post(
            "/api/v1/memory/store",
            json={**MEMORY_PAYLOAD, "failed_asset": "sensor_D"},
            headers=engineer_headers,
        )
        assert mem_resp.status_code == 201
        incident_id = mem_resp.json()["incident_id"]

        report_resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": incident_id},
            headers=auditor_headers,
        )
        assert report_resp.status_code == 201
        return report_resp.json()["report_id"]

    def test_get_report_by_id(self, client, report_id, auditor_headers):
        resp = client.get(f"/api/v1/compliance/{report_id}", headers=auditor_headers)
        assert resp.status_code == 200
        assert resp.json()["report_id"] == report_id

    def test_get_nonexistent_report(self, client, auditor_headers):
        resp = client.get("/api/v1/compliance/nonexistent_report_xyz", headers=auditor_headers)
        assert resp.status_code == 404

    def test_get_report_requires_auth(self, client):
        resp = client.get("/api/v1/compliance/some_report_id")
        assert resp.status_code in (401, 403)


class TestComplianceExport:
    @pytest.fixture(scope="class")
    def report_id(self, client, engineer_headers, auditor_headers):
        mem_resp = client.post(
            "/api/v1/memory/store",
            json={**MEMORY_PAYLOAD, "failed_asset": "pump_export_test"},
            headers=engineer_headers,
        )
        assert mem_resp.status_code == 201
        incident_id = mem_resp.json()["incident_id"]
        report_resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": incident_id},
            headers=auditor_headers,
        )
        assert report_resp.status_code == 201
        return report_resp.json()["report_id"]

    def test_export_pdf(self, client, report_id, auditor_headers):
        resp = client.post(
            "/api/v1/compliance/export/pdf",
            json={"report_id": report_id},
            headers=auditor_headers,
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"

    def test_export_docx(self, client, report_id, auditor_headers):
        resp = client.post(
            "/api/v1/compliance/export/docx",
            json={"report_id": report_id},
            headers=auditor_headers,
        )
        assert resp.status_code == 200
        assert "wordprocessingml" in resp.headers["content-type"]

    def test_export_pdf_nonexistent_report(self, client, auditor_headers):
        resp = client.post(
            "/api/v1/compliance/export/pdf",
            json={"report_id": "nonexistent_xyz"},
            headers=auditor_headers,
        )
        assert resp.status_code == 404

    def test_export_operator_forbidden(self, client, report_id, operator_headers):
        resp = client.post(
            "/api/v1/compliance/export/pdf",
            json={"report_id": report_id},
            headers=operator_headers,
        )
        assert resp.status_code == 403
