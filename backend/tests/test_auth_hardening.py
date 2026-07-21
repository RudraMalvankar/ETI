import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.models import UserModel
from app.models.blacklist import BlacklistedToken

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    db = SessionLocal()
    db.query(UserModel).delete()
    db.query(BlacklistedToken).delete()
    db.commit()
    db.close()

def test_user_lockout_after_failed_logins():
    # 1. Register test user
    reg_payload = {"username": "lockout_user", "password": "securepassword", "role": "Operator"}
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201

    # 2. Make 5 failed logins
    login_payload = {"username": "lockout_user", "password": "wrongpassword"}
    for _ in range(5):
        res = client.post("/api/v1/auth/login", json=login_payload)
        # Should return 401 (Invalid credentials) or 403 on the 5th attempt
        assert res.status_code in [401, 403]

    # 3. 6th attempt must be forbidden lockout
    res_lockout = client.post("/api/v1/auth/login", json=login_payload)
    assert res_lockout.status_code == 403
    assert "temporarily locked" in res_lockout.json()["detail"] or "attempts" in res_lockout.json()["detail"]

def test_token_rotation_and_revocation():
    # 1. Register and Login
    reg_payload = {"username": "rotate_user", "password": "securepassword", "role": "Operator"}
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

def test_password_reset_session_revocation():
    # 1. Register, Login & Get User Info
    reg_payload = {"username": "reset_user", "password": "securepassword", "role": "Operator"}
    client.post("/api/v1/auth/register", json=reg_payload)
    
    login_payload = {"username": "reset_user", "password": "securepassword"}
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    access_token = res.json()["access_token"]

    # 2. Verify me query with active access token
    headers = {"Authorization": f"Bearer {access_token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200

    # 3. Reset password (forces session revocation)
    reset_payload = {"username": "reset_user", "new_password": "newpassword123"}
    res_reset = client.post("/api/v1/auth/reset-password", json=reset_payload)
    assert res_reset.status_code == 200

    # 4. Old access token must now be invalid/revoked
    res_me_revoked = client.get("/api/v1/auth/me", headers=headers)
    assert res_me_revoked.status_code == 401
