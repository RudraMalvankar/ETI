"""
Tests: Audit API
=================
Covers audit log retrieval with RBAC enforcement.
"""

import pytest


class TestAuditLogs:
    def test_list_audit_logs_auditor(self, client, auditor_headers):
        resp = client.get("/api/v1/audit/", headers=auditor_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_audit_logs_admin(self, client, admin_headers):
        resp = client.get("/api/v1/audit/", headers=admin_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_audit_logs_operator_forbidden(self, client, operator_headers):
        resp = client.get("/api/v1/audit/", headers=operator_headers)
        assert resp.status_code == 403

    def test_list_audit_logs_engineer_forbidden(self, client, engineer_headers):
        resp = client.get("/api/v1/audit/", headers=engineer_headers)
        assert resp.status_code == 403

    def test_list_audit_logs_unauthenticated(self, client):
        resp = client.get("/api/v1/audit/")
        assert resp.status_code in (401, 403)

    def test_audit_log_pagination_limit(self, client, auditor_headers):
        resp = client.get("/api/v1/audit/?limit=10&skip=0", headers=auditor_headers)
        assert resp.status_code == 200

    def test_audit_log_invalid_limit(self, client, auditor_headers):
        resp = client.get("/api/v1/audit/?limit=1000", headers=auditor_headers)
        assert resp.status_code in (200, 422)

    def test_audit_log_response_shape(self, client, auditor_headers):
        resp = client.get("/api/v1/audit/", headers=auditor_headers)
        assert resp.status_code == 200
        logs = resp.json()
        for log in logs[:1]:  # Check first log if any
            assert "id" in log
            assert "action" in log
            assert "timestamp" in log
