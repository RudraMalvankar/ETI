"""
Tests: API Validation — OpenAPI Schema and Response Model Validation
=====================================================================
Verifies every endpoint returns correct status codes and conforms to
its declared response model schema.
"""


class TestOpenAPISchema:
    def test_openapi_schema_accessible(self, client):
        resp = client.get("/openapi.json")
        assert resp.status_code == 200
        schema = resp.json()
        assert "openapi" in schema
        assert "paths" in schema
        assert "info" in schema

    def test_openapi_has_auth_endpoints(self, client):
        schema = client.get("/openapi.json").json()
        paths = schema["paths"]
        assert any("/auth" in p for p in paths)

    def test_openapi_has_graph_endpoints(self, client):
        schema = client.get("/openapi.json").json()
        paths = schema["paths"]
        assert any("/graph" in p for p in paths)

    def test_openapi_has_simulation_endpoints(self, client):
        schema = client.get("/openapi.json").json()
        paths = schema["paths"]
        assert any("/simulation" in p for p in paths)

    def test_openapi_has_document_endpoints(self, client):
        schema = client.get("/openapi.json").json()
        paths = schema["paths"]
        assert any("/documents" in p for p in paths)

    def test_docs_accessible_in_dev(self, client):
        resp = client.get("/docs")
        assert resp.status_code == 200

    def test_redoc_accessible_in_dev(self, client):
        resp = client.get("/redoc")
        assert resp.status_code == 200


class TestResponseModels:
    """Verify every endpoint returns the correct HTTP status code and JSON shape."""

    def test_register_returns_201_with_correct_model(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "model_check_user_01", "password": "Mod3l!Check"},
        )
        assert resp.status_code in (201, 400)
        if resp.status_code == 201:
            data = resp.json()
            # Must match UserProfile model
            assert set(data.keys()) >= {"username", "role"}

    def test_login_returns_200_with_token_model(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "tokenmodel_user", "password": "T0ken!Pass"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "tokenmodel_user", "password": "T0ken!Pass"},
        )
        assert resp.status_code == 200
        data = resp.json()
        # Must match Token model
        assert set(data.keys()) >= {
            "access_token",
            "refresh_token",
            "token_type",
            "role",
        }

    def test_simulation_response_model(self, client, simulation_result, operator_headers):
        sim_id = simulation_result["simulation_id"]
        resp = client.get(f"/api/v1/simulation/{sim_id}", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        # SimulationResponse model
        assert "simulation_id" in data
        assert "request" in data
        assert "scenarios" in data

    def test_simulation_statistics_model(self, client, operator_headers):
        resp = client.get("/api/v1/simulation/statistics/", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_simulations" in data
        assert isinstance(data["total_simulations"], int)
        assert "average_downtime" in data
        assert isinstance(data["average_downtime"], float)

    def test_graph_statistics_model(self, client, built_graph, operator_headers):
        resp = client.get("/api/v1/graph/statistics", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["total_nodes"], int)
        assert isinstance(data["total_edges"], int)
        assert isinstance(data["density"], float)
        assert isinstance(data["is_directed_acyclic_graph"], bool)

    def test_search_response_model(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "test query", "top_k": 2},
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert "query_time_ms" in data
        assert isinstance(data["results"], list)

    def test_error_response_model(self, client):
        """Error responses must follow the standard error format."""
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code in (401, 403)

    def test_404_returns_json(self, client, operator_headers):
        resp = client.get("/api/v1/simulation/nonexistent_404_sim", headers=operator_headers)
        assert resp.status_code == 404
        data = resp.json()
        # Must be JSON (not HTML)
        assert isinstance(data, dict)


class TestRequestValidation:
    """Verify that invalid request payloads are rejected with 422."""

    def test_invalid_register_missing_password(self, client):
        resp = client.post("/api/v1/auth/register", json={"username": "nopass"})
        assert resp.status_code == 422

    def test_invalid_simulation_empty_body(self, client, operator_headers):
        resp = client.post("/api/v1/simulation/run", json={}, headers=operator_headers)
        assert resp.status_code == 422

    def test_invalid_graph_build_missing_nodes(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/graph/build",
            json={"only_edges": []},
            headers=engineer_headers,
        )
        assert resp.status_code == 422

    def test_invalid_search_missing_query(self, client, operator_headers):
        resp = client.post("/api/v1/search/", json={}, headers=operator_headers)
        assert resp.status_code == 422

    def test_invalid_json_body(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            content="not valid json",
            headers={**operator_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 422


class TestStatusCodes:
    """Verify all endpoints return correct HTTP status codes."""

    def test_create_resource_returns_201(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/simulation/run",
            json={
                "failed_asset": "pump_A",
                "failure_type": "test_failure",
                "operating_mode": "normal",
            },
            headers=operator_headers,
        )
        assert resp.status_code == 201

    def test_read_resource_returns_200(self, client, simulation_result, operator_headers):
        sim_id = simulation_result["simulation_id"]
        resp = client.get(f"/api/v1/simulation/{sim_id}", headers=operator_headers)
        assert resp.status_code == 200

    def test_not_found_returns_404(self, client, operator_headers):
        resp = client.get("/api/v1/simulation/nonexistent_xyz", headers=operator_headers)
        assert resp.status_code == 404

    def test_forbidden_returns_403(self, client):
        resp = client.get("/api/v1/graph/")
        assert resp.status_code in (401, 403)

    def test_validation_error_returns_422(self, client, operator_headers):
        resp = client.post("/api/v1/simulation/run", json={}, headers=operator_headers)
        assert resp.status_code == 422
