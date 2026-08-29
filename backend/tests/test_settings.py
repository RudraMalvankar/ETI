"""
Tests: Settings API
===================
Covers platform settings GET/PUT with RBAC checks.
"""

import pytest

FULL_SETTINGS_PAYLOAD = {
    "ai_provider": "mock",
    "embedding_provider": "mock",
    "ocr_provider": "mock",
    "confidence_threshold": 85,
    "top_k": 10,
    "rerank_top_k": 5,
    "enable_reranking": True,
    "theme": "dark",
    "notifications_enabled": True,
    "api_base_url": "/api/v1",
    "environment_status": "development",
    "notification_channels": ["dashboard", "email"],
}


class TestSettingsGet:
    def test_get_settings_requires_auth(self, client):
        resp = client.get("/api/v1/settings/")
        assert resp.status_code in (401, 403)

    def test_get_settings_operator_allowed(self, client, operator_headers):
        resp = client.get("/api/v1/settings/", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "settings" in data

    def test_get_settings_engineer_allowed(self, client, engineer_headers):
        resp = client.get("/api/v1/settings/", headers=engineer_headers)
        assert resp.status_code == 200

    def test_get_settings_auditor_allowed(self, client, auditor_headers):
        resp = client.get("/api/v1/settings/", headers=auditor_headers)
        assert resp.status_code == 200

    def test_get_settings_admin_allowed(self, client, admin_headers):
        resp = client.get("/api/v1/settings/", headers=admin_headers)
        assert resp.status_code == 200

    def test_get_settings_returns_envelope(self, client, operator_headers):
        resp = client.get("/api/v1/settings/", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["settings"], dict)
        assert "ai_provider" in data["settings"]
        assert "available_ai_providers" in data
        assert "effective_runtime" in data


class TestSettingsUpdate:
    def test_update_settings_requires_auth(self, client):
        resp = client.put("/api/v1/settings/", json=FULL_SETTINGS_PAYLOAD)
        assert resp.status_code in (401, 403)

    def test_update_settings_requires_admin(self, client, operator_headers):
        resp = client.put(
            "/api/v1/settings/",
            json=FULL_SETTINGS_PAYLOAD,
            headers=operator_headers,
        )
        assert resp.status_code in (401, 403)

    def test_update_settings_admin_allowed(self, client, admin_headers):
        payload = {**FULL_SETTINGS_PAYLOAD, "theme": "light"}
        resp = client.put("/api/v1/settings/", json=payload, headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["settings"]["theme"] == "light"

    def test_update_settings_engineer_forbidden(self, client, engineer_headers):
        resp = client.put(
            "/api/v1/settings/",
            json=FULL_SETTINGS_PAYLOAD,
            headers=engineer_headers,
        )
        assert resp.status_code in (401, 403)

    def test_update_settings_returns_updated_envelope(self, client, admin_headers):
        payload = {**FULL_SETTINGS_PAYLOAD, "theme": "dark"}
        client.put("/api/v1/settings/", json=payload, headers=admin_headers)
        resp = client.get("/api/v1/settings/", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["settings"]["theme"] == "dark"
