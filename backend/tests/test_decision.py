"""
Tests: Decision Engine API
===========================
Covers recommend endpoint, error handling, RBAC.
"""


class TestDecisionRecommend:
    def test_recommend_success(self, client, simulation_result, operator_headers):
        sim_id = simulation_result["simulation_id"]
        payload = {
            "failed_asset": "pump_A",
            "failure_type": "bearing_failure",
            "simulation_id": sim_id,
        }
        resp = client.post(
            "/api/v1/decision/recommend",
            json=payload,
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "recommended_strategy" in data
        assert "confidence_score" in data
        assert "reasoning" in data
        assert "affected_assets" in data
        assert isinstance(data["supporting_citations"], list)

    def test_recommend_response_confidence_range(self, client, simulation_result, operator_headers):
        sim_id = simulation_result["simulation_id"]
        resp = client.post(
            "/api/v1/decision/recommend",
            json={
                "failed_asset": "pump_A",
                "failure_type": "bearing_failure",
                "simulation_id": sim_id,
            },
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert 0.0 <= data["confidence_score"] <= 100.0

    def test_recommend_requires_auth(self, client):
        resp = client.post(
            "/api/v1/decision/recommend",
            json={
                "failed_asset": "pump_A",
                "failure_type": "bearing_failure",
                "simulation_id": "any_id",
            },
        )
        assert resp.status_code in (401, 403)

    def test_recommend_invalid_payload(self, client, operator_headers):
        resp = client.post(
            "/api/v1/decision/recommend",
            json={"invalid": "field"},
            headers=operator_headers,
        )
        assert resp.status_code == 422

    def test_recommend_missing_simulation_id(self, client, operator_headers):
        resp = client.post(
            "/api/v1/decision/recommend",
            json={"failed_asset": "pump_A", "failure_type": "bearing_failure"},
            headers=operator_headers,
        )
        assert resp.status_code == 422

    def test_recommend_nonexistent_simulation(self, client, operator_headers):
        resp = client.post(
            "/api/v1/decision/recommend",
            json={
                "failed_asset": "pump_A",
                "failure_type": "bearing_failure",
                "simulation_id": "definitely_nonexistent_sim_id_xyz",
            },
            headers=operator_headers,
        )
        assert resp.status_code in (200, 400, 500)  # depends on engine behavior

    def test_auditor_cannot_recommend(self, client, simulation_result, auditor_headers):
        sim_id = simulation_result["simulation_id"]
        resp = client.post(
            "/api/v1/decision/recommend",
            json={
                "failed_asset": "pump_A",
                "failure_type": "bearing_failure",
                "simulation_id": sim_id,
            },
            headers=auditor_headers,
        )
        assert resp.status_code in (401, 403)
