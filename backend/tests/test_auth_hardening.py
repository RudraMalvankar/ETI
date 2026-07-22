import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.models import UserModel
from app.models.blacklist import BlacklistedToken
from app.core.auth import get_password_hash

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    db = SessionLocal()
    db.query(UserModel).delete()
    db.query(BlacklistedToken).delete()
    db.commit()
    db.close()

def create_user_with_role(username: str, password: str, role: str):
    """Helper function to seed a user directly into DB with specific role."""
    db = SessionLocal()
    user = UserModel(username=username, hashed_password=get_password_hash(password), role=role)
    db.add(user)
    db.commit()
    db.close()

def test_user_lockout_after_failed_logins():
    # 1. Register test user
    reg_payload = {"username": "lockout_user", "password": "securepassword"}
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201

    # 2. Make 5 failed logins
    login_payload = {"username": "lockout_user", "password": "wrongpassword"}
    for _ in range(5):
        res = client.post("/api/v1/auth/login", json=login_payload)
        assert res.status_code in [401, 403]

    # 3. 6th attempt must be forbidden lockout
    from app.core.rate_limiter import limiter
    limiter._storage.reset()
    res_lockout = client.post("/api/v1/auth/login", json=login_payload)
    assert res_lockout.status_code == 403
    assert "temporarily locked" in res_lockout.json()["detail"] or "attempts" in res_lockout.json()["detail"]

def test_token_rotation_and_revocation():
    # 1. Register and Login
    reg_payload = {"username": "rotate_user", "password": "securepassword"}
    client.post("/api/v1/auth/register", json=reg_payload)
    
    login_payload = {"username": "rotate_user", "password": "securepassword"}
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    tokens = res.json()
    ref_token = tokens["refresh_token"]

    # 2. Rotate refresh token
    res_refresh = client.post("/api/v1/auth/refresh", json={"refresh_token": ref_token})
    assert res_refresh.status_code == 200
    new_tokens = res_refresh.json()
    assert new_tokens["refresh_token"] != ref_token

    # 3. Attempting to reuse old refresh token should fail (rotated/blacklisted)
    res_reuse = client.post("/api/v1/auth/refresh", json={"refresh_token": ref_token})
    assert res_reuse.status_code == 401

def test_password_reset_authenticated_verification():
    # 1. Register, Login & Get User Info
    reg_payload = {"username": "reset_user", "password": "securepassword"}
    client.post("/api/v1/auth/register", json=reg_payload)
    
    login_payload = {"username": "reset_user", "password": "securepassword"}
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    access_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Reset password using incorrect old password -> must fail (401)
    wrong_reset = {"old_password": "wrongoldpassword", "new_password": "newpassword123"}
    res_wrong = client.post("/api/v1/auth/reset-password", json=wrong_reset, headers=headers)
    assert res_wrong.status_code == 401

    # 3. Reset password with correct old password -> must succeed
    correct_reset = {"old_password": "securepassword", "new_password": "newpassword123"}
    res_reset = client.post("/api/v1/auth/reset-password", json=correct_reset, headers=headers)
    assert res_reset.status_code == 200

    # 4. Old access token must now be invalid/revoked due to session revocation
    res_me_revoked = client.get("/api/v1/auth/me", headers=headers)
    assert res_me_revoked.status_code == 401

def test_registration_role_escalation_prevented():
    """Verify that self-registration ignores user role parameter and forces default Operator role."""
    payload = {"username": "hacker_user", "password": "securepassword", "role": "Admin"}
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    user_data = res.json()
    assert user_data["role"] == "Operator", "Self-registration must enforce Operator role and prevent role escalation!"

def test_unauthenticated_password_reset_rejected():
    """Verify unauthenticated requests to /reset-password return 401 Unauthorized."""
    reset_payload = {"old_password": "any", "new_password": "newpassword123"}
    res = client.post("/api/v1/auth/reset-password", json=reset_payload)
    assert res.status_code == 401

def test_protected_endpoints_require_auth():
    """Verify protected endpoints return 401 Unauthorized when requested without auth header."""
    res_doc = client.get("/api/v1/documents/")
    assert res_doc.status_code == 401

    res_comp = client.get("/api/v1/compliance/rep-101")
    assert res_comp.status_code == 401

    res_audit = client.get("/api/v1/audit/")
    assert res_audit.status_code == 401

def test_rbac_access_control_enforced():
    """Verify RBAC role checks return 403 Forbidden when an unauthorized role accesses a restricted route."""
    # Register default Operator user
    reg_payload = {"username": "op_user", "password": "securepassword"}
    client.post("/api/v1/auth/register", json=reg_payload)
    login_res = client.post("/api/v1/auth/login", json={"username": "op_user", "password": "securepassword"})
    op_token = login_res.json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}

    # Operator accessing Audit endpoint (restricted to Auditor, Admin) -> must return 403
    res_audit = client.get("/api/v1/audit/", headers=op_headers)
    assert res_audit.status_code == 403

    # Operator accessing Compliance report -> must return 403
    res_comp = client.get("/api/v1/compliance/rep-101", headers=op_headers)
    assert res_comp.status_code == 403

def test_rbac_authorized_role_access():
    """Verify authorized role (Auditor) can access Audit and Compliance endpoints successfully."""
    create_user_with_role("auditor_user", "securepassword", "Auditor")
    login_res = client.post("/api/v1/auth/login", json={"username": "auditor_user", "password": "securepassword"})
    aud_token = login_res.json()["access_token"]
    aud_headers = {"Authorization": f"Bearer {aud_token}"}

    res_audit = client.get("/api/v1/audit/", headers=aud_headers)
    assert res_audit.status_code == 200
