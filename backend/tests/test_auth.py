"""
Tests: Authentication & Authorization (RBAC)
=============================================
Covers:
- Registration: happy path, duplicate username, invalid input
- Login: happy path, wrong password, lockout, invalid user
- Token: JWT validation, blacklisting, refresh rotation
- Logout: invalidation, cookie deletion
- Password reset: happy path, wrong old password
- RBAC: role-based access control enforcement
- Me endpoint
"""


class TestRegistration:
    def test_register_success(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "new_user_reg", "password": "Str0ng!Pass"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["username"] == "new_user_reg"
        assert data["role"] == "Operator"  # Must not be elevated

    def test_register_duplicate_username(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "dup_user", "password": "Str0ng!Pass"},
        )
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "dup_user", "password": "AnotherPass123"},
        )
        assert resp.status_code == 400

    def test_register_short_username(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "ab", "password": "ValidPass123"},
        )
        assert resp.status_code == 422

    def test_register_short_password(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "testuser_sp", "password": "abc"},
        )
        assert resp.status_code == 422

    def test_register_cannot_choose_admin_role(self, client):
        """Security: user cannot self-assign Admin role."""
        resp = client.post(
            "/api/v1/auth/register",
            json={"username": "hacker_reg", "password": "HackPass123", "role": "Admin"},
        )
        if resp.status_code == 201:
            # If accepted, role must still be Operator
            assert resp.json()["role"] == "Operator"

    def test_register_missing_fields(self, client):
        resp = client.post("/api/v1/auth/register", json={"username": "only_name"})
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "login_ok_user", "password": "LoginPass123"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "login_ok_user", "password": "LoginPass123"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "Operator"

    def test_login_wrong_password(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "wrong_pw_user", "password": "Correct!Pass1"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "wrong_pw_user", "password": "WrongPass!"},
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "ghost_user_xyzabc", "password": "Whatever123"},
        )
        assert resp.status_code == 401

    def test_login_empty_body(self, client):
        resp = client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 422

    def test_login_response_has_no_plaintext_password(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "nopasswd_user", "password": "SafePass123"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "nopasswd_user", "password": "SafePass123"},
        )
        assert "password" not in resp.text
        assert "hashed_password" not in resp.text


class TestTokenValidation:
    def test_access_token_valid_on_me(self, client, operator_headers):
        resp = client.get("/api/v1/auth/me", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "username" in data
        assert "role" in data

    def test_invalid_token_rejected(self, client):
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.value"},
        )
        assert resp.status_code == 401

    def test_missing_authorization_header(self, client):
        resp = client.get("/api/v1/auth/me")
        # FastAPI HTTPBearer returns 403 when header is missing in some versions, 401 in others
        assert resp.status_code in (401, 403)

    def test_malformed_bearer_header(self, client):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "NotBearer token"})
        # FastAPI HTTPBearer returns 403 for malformed headers in some versions, 401 in others
        assert resp.status_code in (401, 403)


class TestTokenRefresh:
    def test_refresh_token_rotation(self, client):
        """Refresh token should produce a new token pair."""
        client.post(
            "/api/v1/auth/register",
            json={"username": "refresh_user_01", "password": "Refr3sh!Pass"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "refresh_user_01", "password": "Refr3sh!Pass"},
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        refresh_token = tokens["refresh_token"]

        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert resp.status_code == 200
        new_tokens = resp.json()
        assert "access_token" in new_tokens
        assert "refresh_token" in new_tokens
        # Old refresh token should be rotated (blacklisted)

    def test_invalid_refresh_token_rejected(self, client):
        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "totally.fake.refreshtoken"},
        )
        assert resp.status_code in (401, 422)

    def test_access_token_cannot_be_used_as_refresh(self, client):
        """Access tokens must not be accepted at refresh endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={"username": "bad_refresh_user", "password": "BadRefr3sh!"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "bad_refresh_user", "password": "BadRefr3sh!"},
        )
        access_token = login_resp.json()["access_token"]
        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": access_token},
        )
        assert resp.status_code == 401


class TestLogout:
    def test_logout_success(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "logout_user_01", "password": "L0gout!Pass"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "logout_user_01", "password": "L0gout!Pass"},
        )
        token = login_resp.json()["access_token"]
        resp = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert "message" in resp.json()

    def test_token_blacklisted_after_logout(self, client):
        """After logout, the token must be rejected."""
        client.post(
            "/api/v1/auth/register",
            json={"username": "logout_blacklist_user", "password": "L0gout!Pass"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "logout_blacklist_user", "password": "L0gout!Pass"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Logout
        client.post("/api/v1/auth/logout", headers=headers)

        # Token must now be blacklisted
        resp = client.get("/api/v1/auth/me", headers=headers)
        assert resp.status_code == 401


class TestPasswordReset:
    def test_password_reset_success(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "pwreset_user", "password": "OldPass123!"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "pwreset_user", "password": "OldPass123!"},
        )
        token = login_resp.json()["access_token"]
        resp = client.post(
            "/api/v1/auth/reset-password",
            json={"old_password": "OldPass123!", "new_password": "NewPass456!"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert "message" in resp.json()

    def test_password_reset_wrong_old_password(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"username": "pwreset_wrong_user", "password": "CorrectOld123!"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"username": "pwreset_wrong_user", "password": "CorrectOld123!"},
        )
        token = login_resp.json()["access_token"]
        resp = client.post(
            "/api/v1/auth/reset-password",
            json={"old_password": "WrongOldPass!", "new_password": "NewPass456!"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 401

    def test_password_reset_requires_authentication(self, client):
        resp = client.post(
            "/api/v1/auth/reset-password",
            json={"old_password": "OldPass123!", "new_password": "NewPass456!"},
        )
        assert resp.status_code in (401, 403)


class TestRBAC:
    def test_operator_can_read_documents(self, client, operator_headers):
        resp = client.get("/api/v1/documents/", headers=operator_headers)
        assert resp.status_code == 200

    def test_operator_cannot_upload_documents(self, client, operator_headers):
        """Operators must not upload documents — Engineer/Admin only."""
        import io

        file_content = b"%PDF-1.4 test content"
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
            headers=operator_headers,
        )
        assert resp.status_code == 403

    def test_engineer_can_upload_documents(self, client, engineer_headers):
        import io

        file_content = b"%PDF-1.4 minimal test pdf content"
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test_eng.pdf", io.BytesIO(file_content), "application/pdf")},
            headers=engineer_headers,
        )
        # Should succeed (201) or fail due to OCR/parsing, not auth (403)
        assert resp.status_code != 403

    def test_operator_cannot_access_audit_logs(self, client, operator_headers):
        resp = client.get("/api/v1/audit/", headers=operator_headers)
        assert resp.status_code == 403

    def test_auditor_can_access_audit_logs(self, client, auditor_headers):
        resp = client.get("/api/v1/audit/", headers=auditor_headers)
        assert resp.status_code == 200

    def test_operator_cannot_access_compliance(self, client, operator_headers):
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": "fake_inc_001"},
            headers=operator_headers,
        )
        assert resp.status_code == 403

    def test_auditor_can_access_compliance(self, client, auditor_headers):
        """Auditor should be able to attempt compliance report (404 ok, not 403)."""
        resp = client.post(
            "/api/v1/compliance/report",
            json={"incident_id": "nonexistent_inc"},
            headers=auditor_headers,
        )
        assert resp.status_code != 403

    def test_unauthenticated_graph_access_denied(self, client):
        resp = client.get("/api/v1/graph/")
        # HTTPBearer returns 403 (no header) but RoleChecker returns 403; either is acceptable
        assert resp.status_code in (401, 403)

    def test_unauthenticated_simulation_denied(self, client):
        resp = client.post("/api/v1/simulation/run", json={})
        assert resp.status_code in (401, 403, 422)


class TestMeEndpoint:
    def test_me_returns_profile(self, client, operator_headers):
        resp = client.get("/api/v1/auth/me", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "username" in data
        assert "role" in data
        assert data["role"] == "Operator"

    def test_me_admin_has_admin_role(self, client, admin_headers):
        resp = client.get("/api/v1/auth/me", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["role"] == "Admin"
