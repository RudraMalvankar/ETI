import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_prometheus_observability_endpoint():
    # 1. Fire a dummy health request to populate request metrics
    res_health = client.get("/health")
    assert res_health.status_code == 200

    # 2. Query /metrics endpoint to scrape output
    res_metrics = client.get("/metrics")
    assert res_metrics.status_code == 200
    assert "http_requests_total" in res_metrics.text
    assert 'path="/health"' in res_metrics.text
