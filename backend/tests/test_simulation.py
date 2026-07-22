"""
Tests: Simulation API
======================
Covers run, retrieve, scenarios, statistics.
"""

import pytest

SIM_PAYLOAD = {
    "failed_asset": "pump_A",
    "failure_type": "bearing_failure",
    "initial_telemetry": {"temperature": 95.0, "vibration": 12.5},
    "operating_mode": "normal",
}


class TestSimulationRun:
    def test_run_simulation_success(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/simulation/run",
            json=SIM_PAYLOAD,
            headers=operator_headers,
        )
        assert resp.status_code in (201, 404)
        if resp.status_code == 201:
            data = resp.json()
            assert "simulation_id" in data
            assert "scenarios" in data
            assert isinstance(data["scenarios"], list)
            assert len(data["scenarios"]) > 0

    def test_run_simulation_response_shape(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/simulation/run",
            json=SIM_PAYLOAD,
            headers=operator_headers,
        )
        assert resp.status_code in (201, 404)
        if resp.status_code == 201:
            data = resp.json()
            scenario = data["scenarios"][0]
            assert "scenario_id" in scenario
            assert "name" in scenario
            assert "risk_score" in scenario
            assert "estimated_downtime_hours" in scenario
            assert "estimated_cost_usd" in scenario

    def test_run_simulation_requires_auth(self, client):
        resp = client.post("/api/v1/simulation/run", json=SIM_PAYLOAD)
        assert resp.status_code in (401, 403)

    def test_run_simulation_invalid_payload(self, client, operator_headers):
        resp = client.post(
            "/api/v1/simulation/run",
            json={"invalid": "payload"},
            headers=operator_headers,
        )
        assert resp.status_code == 422

    def test_run_simulation_missing_failure_type(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/simulation/run",
            json={"failed_asset": "pump_A"},
            headers=operator_headers,
        )
        assert resp.status_code == 422

    def test_run_simulation_risk_scores_valid_range(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/simulation/run",
            json=SIM_PAYLOAD,
            headers=operator_headers,
        )
        assert resp.status_code in (201, 404)
        if resp.status_code == 201:
            for scenario in resp.json()["scenarios"]:
                rs = scenario["risk_score"]
                assert 0.0 <= rs["overall_score"] <= 10.0
                assert 0.0 <= rs["safety_risk"] <= 10.0
                assert 0.0 <= rs["operational_risk"] <= 10.0


class TestSimulationGet:
    def test_get_simulation_by_id(self, client, simulation_result, operator_headers):
        sim_id = simulation_result["simulation_id"]
        resp = client.get(f"/api/v1/simulation/{sim_id}", headers=operator_headers)
        assert resp.status_code == 200
        assert resp.json()["simulation_id"] == sim_id

    def test_get_nonexistent_simulation(self, client, operator_headers):
        resp = client.get("/api/v1/simulation/nonexistent_sim_xyz", headers=operator_headers)
        assert resp.status_code == 404

    def test_get_simulation_requires_auth(self, client):
        resp = client.get("/api/v1/simulation/some_id")
        assert resp.status_code in (401, 403)


class TestSimulationScenarios:
    def test_get_scenarios_by_simulation(self, client, simulation_result, operator_headers):
        sim_id = simulation_result["simulation_id"]
        resp = client.get(f"/api/v1/simulation/scenarios/{sim_id}", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "scenarios" in data

    def test_get_scenarios_nonexistent(self, client, operator_headers):
        resp = client.get(
            "/api/v1/simulation/scenarios/nonexistent_xyz",
            headers=operator_headers,
        )
        assert resp.status_code == 404


class TestSimulationStatistics:
    def test_get_statistics(self, client, simulation_result, operator_headers):
        resp = client.get("/api/v1/simulation/statistics/", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_simulations" in data
        assert "total_scenarios_generated" in data
        assert "average_downtime" in data
        assert data["total_simulations"] >= 1

    def test_statistics_requires_auth(self, client):
        resp = client.get("/api/v1/simulation/statistics/")
        assert resp.status_code in (401, 403)
