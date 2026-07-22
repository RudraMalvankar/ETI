"""
Tests: Explainability API
==========================
Covers explain endpoint with RBAC.
"""

import pytest


EXPLAIN_CONTEXT = {
    "failed_asset": "pump_A",
    "failure_type": "bearing_failure",
    "simulation_id": "test_sim",
    "recommended_strategy": "Replace bearing assembly",
    "confidence_score": 87.5,
    "affected_assets": ["pump_A", "valve_B"],
}


class TestExplainability:
    def test_explain_success(self, client, operator_headers):
        resp = client.post(
            "/api/v1/explainability/explain",
            json=EXPLAIN_CONTEXT,
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "reasoning_summary" in data

    def test_explain_response_shape(self, client, operator_headers):
        resp = client.post(
            "/api/v1/explainability/explain",
            json=EXPLAIN_CONTEXT,
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data.get("reasoning_summary"), str)

    def test_explain_empty_context(self, client, operator_headers):
        resp = client.post(
            "/api/v1/explainability/explain",
            json={},
            headers=operator_headers,
        )
        assert resp.status_code == 200  # Engine should handle empty gracefully

    def test_explain_requires_auth(self, client):
        resp = client.post(
            "/api/v1/explainability/explain",
            json=EXPLAIN_CONTEXT,
        )
        assert resp.status_code in (401, 403)

    def test_auditor_can_explain(self, client, auditor_headers):
        resp = client.post(
            "/api/v1/explainability/explain",
            json=EXPLAIN_CONTEXT,
            headers=auditor_headers,
        )
        assert resp.status_code == 200

    def test_explain_with_minimal_context(self, client, operator_headers):
        resp = client.post(
            "/api/v1/explainability/explain",
            json={"failed_asset": "pump_A"},
            headers=operator_headers,
        )
        assert resp.status_code == 200
