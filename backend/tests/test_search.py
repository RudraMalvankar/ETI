"""
Tests: Search API
==================
Covers semantic search endpoint, RBAC, edge cases.
"""


class TestSemanticSearch:
    def test_search_returns_results(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "pump bearing failure", "top_k": 3},
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert "query_time_ms" in data
        assert isinstance(data["results"], list)
        assert isinstance(data["query_time_ms"], int)

    def test_search_default_top_k(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "valve maintenance"},
            headers=operator_headers,
        )
        assert resp.status_code == 200

    def test_search_with_asset_filter(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "bearing failure", "top_k": 5, "asset_id": "pump_A"},
            headers=operator_headers,
        )
        assert resp.status_code == 200

    def test_search_with_document_filter(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={
                "query": "maintenance procedure",
                "top_k": 3,
                "document_id": "doc_xyz",
            },
            headers=operator_headers,
        )
        assert resp.status_code == 200

    def test_search_empty_query_allowed(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": ""},
            headers=operator_headers,
        )
        # Empty query should either return empty results or 422
        assert resp.status_code in (200, 422)

    def test_search_result_shape(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "pump failure", "top_k": 2},
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        for result in data["results"]:
            assert "chunk_id" in result
            assert "document_id" in result
            assert "text" in result
            assert "score" in result
            assert "metadata" in result

    def test_search_requires_auth(self, client):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "pump failure"},
        )
        assert resp.status_code in (401, 403)

    def test_search_invalid_payload(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"invalid_field": "value"},
            headers=operator_headers,
        )
        assert resp.status_code == 422

    def test_search_top_k_limits_results(self, client, operator_headers):
        resp = client.post(
            "/api/v1/search/",
            json={"query": "any failure", "top_k": 2},
            headers=operator_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["results"]) <= 2
