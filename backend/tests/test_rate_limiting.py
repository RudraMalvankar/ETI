import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.main import app
from app.models.models import UserModel

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_rate_limiting():
    # Force rate limiting active for this test suite
    from app.core.rate_limiter import limiter

    limiter.enabled = True

    db = SessionLocal()
    db.query(UserModel).delete()
    db.commit()
    db.close()

    yield

    # Restore bypass defaults
    limiter.enabled = False


def test_login_rate_limiting():
    # 1. Register test user
    reg_payload = {
        "username": "limit_user",
        "password": "securepassword",
        "role": "Operator",
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201

    # 2. Make 5 fast login requests (the limit is 5/minute)
    login_payload = {"username": "limit_user", "password": "securepassword"}
    for _ in range(5):
        res = client.post("/api/v1/auth/login", json=login_payload)
        assert res.status_code == 200

    # 3. 6th request must trigger HTTP 429 Rate Limit Exceeded
    res_limit = client.post("/api/v1/auth/login", json=login_payload)
    assert res_limit.status_code == 429
    assert "Too Many Requests" in res_limit.text or "limit exceeded" in res_limit.text.lower()
