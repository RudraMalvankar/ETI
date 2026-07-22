"""
Tests: Runbook Engine API
==========================
Covers generate, get, feedback, regenerate, statistics.
"""

import pytest


def make_runbook_payload(simulation_result):
    sim_id = simulation_result["simulation_id"]
    scenario = simulation_result["scenarios"][0]
    return {
        "simulation_id": sim_id,
        "decision_payload": {
            "recommended_strategy": "Isolate and Replace Bearing",
            "alternative_strategies": ["Temporary Bypass", "Scheduled Maintenance"],
            "reasoning": "High vibration indicates imminent bearing failure.",
            "supporting_citations": [],
            "confidence_score": 87.5,
            "affected_assets": scenario.get("affected_assets", ["pump_A"]),
            "estimated_risk_reduction": 0.75,
            "estimated_cost": 15000.0,
            "estimated_downtime": 4.0,
        },
    }


class TestRunbookGenerate:
    def test_generate_runbook_success(self, client, simulation_result, operator_headers):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload, headers=operator_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert "runbook_id" in data
        assert "steps" in data
        assert isinstance(data["steps"], list)
        assert len(data["steps"]) > 0

    def test_generate_runbook_response_shape(self, client, simulation_result, operator_headers):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload, headers=operator_headers)
        assert resp.status_code == 201
        data = resp.json()
        step = data["steps"][0]
        assert "step_id" in step
        assert "title" in step
        assert "description" in step
        assert "priority" in step

    def test_generate_requires_auth(self, client, simulation_result):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload)
        assert resp.status_code in (401, 403)

    def test_generate_invalid_payload(self, client, operator_headers):
        resp = client.post(
            "/api/v1/runbook/generate",
            json={"missing": "required_fields"},
            headers=operator_headers,
        )
        assert resp.status_code == 422

    def test_auditor_cannot_generate(self, client, simulation_result, auditor_headers):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload, headers=auditor_headers)
        assert resp.status_code == 403


class TestRunbookGet:
    @pytest.fixture(scope="class")
    def runbook_id(self, client, simulation_result, operator_headers):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload, headers=operator_headers)
        assert resp.status_code == 201
        return resp.json()["runbook_id"]

    def test_get_runbook_success(self, client, runbook_id, operator_headers):
        resp = client.get(f"/api/v1/runbook/{runbook_id}", headers=operator_headers)
        assert resp.status_code == 200
        assert resp.json()["runbook_id"] == runbook_id

    def test_get_nonexistent_runbook(self, client, operator_headers):
        resp = client.get("/api/v1/runbook/nonexistent_rb_xyz", headers=operator_headers)
        assert resp.status_code == 404

    def test_get_runbook_requires_auth(self, client):
        resp = client.get("/api/v1/runbook/some_id")
        assert resp.status_code in (401, 403)


class TestRunbookFeedback:
    @pytest.fixture(scope="class")
    def runbook(self, client, simulation_result, operator_headers):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload, headers=operator_headers)
        assert resp.status_code == 201
        return resp.json()

    def test_feedback_step_completed(self, client, runbook, operator_headers):
        rb_id = runbook["runbook_id"]
        step_id = runbook["steps"][0]["step_id"]
        resp = client.put(
            f"/api/v1/runbook/{rb_id}/step/{step_id}",
            json={"status": "completed", "feedback_notes": "Step completed successfully"},
            headers=operator_headers,
        )
        assert resp.status_code == 200

    def test_feedback_invalid_runbook(self, client, operator_headers):
        resp = client.put(
            "/api/v1/runbook/nonexistent_rb/step/step_1",
            json={"status": "completed", "feedback_notes": "done"},
            headers=operator_headers,
        )
        assert resp.status_code == 404

    def test_feedback_requires_auth(self, client):
        resp = client.put(
            "/api/v1/runbook/some_rb/step/some_step",
            json={"status": "completed", "feedback_notes": "done"},
        )
        assert resp.status_code in (401, 403)


class TestRunbookRegenerate:
    @pytest.fixture(scope="class")
    def runbook_id(self, client, simulation_result, operator_headers):
        payload = make_runbook_payload(simulation_result)
        resp = client.post("/api/v1/runbook/generate", json=payload, headers=operator_headers)
        assert resp.status_code == 201
        return resp.json()["runbook_id"]

    def test_regenerate_runbook(self, client, runbook_id, operator_headers):
        resp = client.post(
            f"/api/v1/runbook/{runbook_id}/regenerate",
            headers=operator_headers,
        )
        assert resp.status_code == 200

    def test_regenerate_nonexistent(self, client, operator_headers):
        resp = client.post(
            "/api/v1/runbook/nonexistent_rb_xyz/regenerate",
            headers=operator_headers,
        )
        assert resp.status_code == 404


class TestRunbookStatistics:
    def test_get_statistics(self, client, operator_headers):
        resp = client.get("/api/v1/runbook/statistics/", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_runbooks" in data
        assert "active_runbooks" in data
        assert "completed_runbooks" in data
        assert "total_regenerations" in data

    def test_statistics_requires_auth(self, client):
        resp = client.get("/api/v1/runbook/statistics/")
        assert resp.status_code in (401, 403)
