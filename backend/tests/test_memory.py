"""
Tests: Memory (Operational Memory Engine) API
==============================================
Covers store, retrieve, search, trends.
"""

import pytest


MEMORY_PAYLOAD = {
    "failed_asset": "comp_C",
    "failure_type": "overheating",
    "simulation_id": "",
    "runbook_id": "",
    "decision_data": {"strategy": "cool and inspect"},
    "outcome": "Resolved",
    "technician_feedback": ["Temperature normalized after cooling"],
}


class TestMemoryStore:
    def test_store_incident_success(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/memory/store",
            json=MEMORY_PAYLOAD,
            headers=engineer_headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "incident_id" in data
        assert data["failed_asset"] == "comp_C"
        assert data["failure_type"] == "overheating"

    def test_store_incident_response_shape(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/memory/store",
            json=MEMORY_PAYLOAD,
            headers=engineer_headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "incident_id" in data
        assert "timestamp" in data
        assert "outcome" in data

    def test_store_requires_auth(self, client):
        resp = client.post("/api/v1/memory/store", json=MEMORY_PAYLOAD)
        assert resp.status_code in (401, 403)

    def test_operator_cannot_store(self, client, operator_headers):
        resp = client.post(
            "/api/v1/memory/store",
            json=MEMORY_PAYLOAD,
            headers=operator_headers,
        )
        assert resp.status_code == 403

    def test_store_invalid_payload(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/memory/store",
            json={"missing": "required_fields"},
            headers=engineer_headers,
        )
        assert resp.status_code == 422


class TestMemoryList:
    def test_list_incidents(self, client, operator_headers):
        resp = client.get("/api/v1/memory/incidents", headers=operator_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_incidents_after_store(self, client, engineer_headers, operator_headers):
        client.post("/api/v1/memory/store", json=MEMORY_PAYLOAD, headers=engineer_headers)
        resp = client.get("/api/v1/memory/incidents", headers=operator_headers)
        assert resp.status_code == 200
        incidents = resp.json()
        assert len(incidents) > 0

    def test_list_requires_auth(self, client):
        resp = client.get("/api/v1/memory/incidents")
        assert resp.status_code in (401, 403)


class TestMemoryGet:
    @pytest.fixture(scope="class")
    def incident_id(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/memory/store",
            json=MEMORY_PAYLOAD,
            headers=engineer_headers,
        )
        assert resp.status_code == 201
        return resp.json()["incident_id"]

    def test_get_incident_by_id(self, client, incident_id, operator_headers):
        resp = client.get(f"/api/v1/memory/{incident_id}", headers=operator_headers)
        assert resp.status_code == 200
        assert resp.json()["incident_id"] == incident_id

    def test_get_nonexistent_incident(self, client, operator_headers):
        resp = client.get("/api/v1/memory/nonexistent_inc_xyz", headers=operator_headers)
        assert resp.status_code == 404

    def test_get_requires_auth(self, client):
        resp = client.get("/api/v1/memory/some_id")
        assert resp.status_code in (401, 403)


class TestMemorySearch:
    def test_search_incidents(self, client, operator_headers):
        resp = client.post(
            "/api/v1/memory/search",
            json={"query": "overheating compressor", "top_k": 3},
            headers=operator_headers,
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_search_requires_auth(self, client):
        resp = client.post(
            "/api/v1/memory/search",
            json={"query": "pump failure"},
        )
        assert resp.status_code in (401, 403)

    def test_search_invalid_payload(self, client, operator_headers):
        resp = client.post(
            "/api/v1/memory/search",
            json={"bad_field": "value"},
            headers=operator_headers,
        )
        assert resp.status_code == 422


class TestMemoryTrends:
    def test_get_trends(self, client, operator_headers):
        resp = client.get("/api/v1/memory/trends", headers=operator_headers)
        assert resp.status_code == 200

    def test_trends_requires_auth(self, client):
        resp = client.get("/api/v1/memory/trends")
        assert resp.status_code in (401, 403)
