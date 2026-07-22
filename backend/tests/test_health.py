"""
Tests: Health, Readiness, and Liveness endpoints
"""


class TestRootHealth:
    def test_root_health_returns_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "apex-backend"

    def test_root_health_has_environment(self, client):
        resp = client.get("/health")
        data = resp.json()
        assert "environment" in data

    def test_root_health_has_ai_provider(self, client):
        resp = client.get("/health")
        data = resp.json()
        assert "ai_provider" in data


class TestApiV1Health:
    def test_v1_health_returns_ok(self, client):
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"

    def test_v1_health_service_name(self, client):
        resp = client.get("/api/v1/health")
        data = resp.json()
        assert data["service"] == "apex-backend"


class TestReadyEndpoint:
    def test_ready_endpoint_exists(self, client):
        """GET /ready should return 200 or 503 (not 404)."""
        resp = client.get("/ready")
        assert resp.status_code in (200, 503)

    def test_ready_endpoint_json(self, client):
        resp = client.get("/ready")
        data = resp.json()
        assert "status" in data


class TestLiveEndpoint:
    def test_live_endpoint_exists(self, client):
        """GET /live should always return 200 if server is up."""
        resp = client.get("/live")
        assert resp.status_code == 200

    def test_live_endpoint_json(self, client):
        resp = client.get("/live")
        data = resp.json()
        assert data.get("status") == "alive"


class TestMetricsEndpoint:
    def test_metrics_accessible(self, client):
        resp = client.get("/metrics")
        assert resp.status_code == 200
