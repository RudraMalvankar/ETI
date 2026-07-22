"""
APEX Sprint 5 — Comprehensive Test Fixtures
=============================================
Provides shared fixtures for all backend tests:
- In-memory SQLite test database
- Authenticated test clients for each RBAC role
- Token factories
- Mocked external services (AI, Qdrant, Redis)
"""

import os
import sys

# Ensure the backend root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set test JWT secret BEFORE importing app modules
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-pytest-suite-only")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-pytest-suite-only")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("AI_PROVIDER", "mock")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.rate_limiter import limiter
from app.database.session import Base, get_db
from app.main import app

# ──────────────────────────────────────────────────────────────
# In-memory SQLite database for isolated tests
# ──────────────────────────────────────────────────────────────

SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"  # Pure in-memory

engine_test = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Apply DB override
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    """Create all tables in the in-memory DB once per session."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(autouse=True)
def reset_rate_limit():
    """Clear rate limit storage between tests to prevent 429 cascades."""
    limiter._storage.reset()


# ──────────────────────────────────────────────────────────────
# Helper: create a user and return a token
# ──────────────────────────────────────────────────────────────


def get_token_for_role(client: TestClient, username: str, password: str, role: str) -> str:
    """Register a user with given credentials then inject the role directly, return JWT."""
    from sqlalchemy.orm import Session

    from app.core.auth import create_access_token, get_password_hash
    from app.models.models import UserModel

    db: Session = TestingSessionLocal()
    try:
        existing = db.query(UserModel).filter(UserModel.username == username).first()
        if not existing:
            user = UserModel(
                username=username,
                hashed_password=get_password_hash(password),
                role=role,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            existing.role = role
            db.commit()
            db.refresh(existing)
            user = existing

        token = create_access_token(
            data={"sub": user.username, "role": user.role, "sid": "test-sid"}
        )
        # Patch session id so decode validates
        user.current_session_id = "test-sid"
        db.commit()
    finally:
        db.close()
    return token


# ──────────────────────────────────────────────────────────────
# Base TestClient
# ──────────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def client():
    """Unauthenticated test client."""
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


# ──────────────────────────────────────────────────────────────
# Role-scoped authenticated clients
# ──────────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def operator_token(client):
    return get_token_for_role(client, "test_operator", "Op3r@tor!", "Operator")


@pytest.fixture(scope="session")
def engineer_token(client):
    return get_token_for_role(client, "test_engineer", "Eng1neer!", "Engineer")


@pytest.fixture(scope="session")
def auditor_token(client):
    return get_token_for_role(client, "test_auditor", "Aud1tor!", "Auditor")


@pytest.fixture(scope="session")
def admin_token(client):
    return get_token_for_role(client, "test_admin", "Adm1n!", "Admin")


@pytest.fixture(scope="session")
def operator_headers(operator_token):
    return {"Authorization": f"Bearer {operator_token}"}


@pytest.fixture(scope="session")
def engineer_headers(engineer_token):
    return {"Authorization": f"Bearer {engineer_token}"}


@pytest.fixture(scope="session")
def auditor_headers(auditor_token):
    return {"Authorization": f"Bearer {auditor_token}"}


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ──────────────────────────────────────────────────────────────
# Graph fixture: Build a minimal test graph
# ──────────────────────────────────────────────────────────────

SAMPLE_GRAPH_PAYLOAD = {
    "nodes": [
        {
            "node_id": "pump_A",
            "asset_id": "pump_A",
            "asset_type": "Pump",
            "status": "operational",
            "criticality": "high",
        },
        {
            "node_id": "valve_B",
            "asset_id": "valve_B",
            "asset_type": "Valve",
            "status": "operational",
            "criticality": "medium",
        },
        {
            "node_id": "comp_C",
            "asset_id": "comp_C",
            "asset_type": "Compressor",
            "status": "operational",
            "criticality": "high",
        },
    ],
    "edges": [
        {
            "edge_id": "e1",
            "source": "pump_A",
            "target": "valve_B",
            "relationship": "feeds",
            "weight": 1.0,
            "risk_factor": 0.8,
        },
        {
            "edge_id": "e2",
            "source": "valve_B",
            "target": "comp_C",
            "relationship": "supplies",
            "weight": 1.0,
            "risk_factor": 0.9,
        },
    ],
}


@pytest.fixture(scope="session")
def built_graph(client, engineer_headers):
    """Build graph once per session and return response."""
    resp = client.post("/api/v1/graph/build", json=SAMPLE_GRAPH_PAYLOAD, headers=engineer_headers)
    assert resp.status_code == 201, f"Graph build failed: {resp.text}"
    return resp.json()


# ──────────────────────────────────────────────────────────────
# Simulation fixture
# ──────────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def simulation_result(client, built_graph, operator_headers):
    """Run a simulation once per session."""
    payload = {
        "failed_asset": "pump_A",
        "failure_type": "bearing_failure",
        "initial_telemetry": {"temperature": 95.0, "vibration": 12.5},
        "operating_mode": "normal",
    }
    resp = client.post("/api/v1/simulation/run", json=payload, headers=operator_headers)
    assert resp.status_code == 201, f"Simulation failed: {resp.text}"
    return resp.json()
