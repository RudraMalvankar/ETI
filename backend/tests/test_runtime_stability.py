import sys
import os
import importlib
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import SessionLocal
from app.models.models import UserModel
from app.core.auth import get_password_hash
from app.schemas.document import IngestedDocument, DocumentChunk
from app.schemas.memory import IncidentMemory
from app.schemas.simulation import SimulationRequest
from app.services.memory.MemorySerializer import MemorySerializer
from app.services.compliance.TimelineBuilder import TimelineBuilder

client = TestClient(app)

@pytest.fixture
def admin_headers():
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.username == "st_admin").first()
    if not user:
        user = UserModel(username="st_admin", hashed_password=get_password_hash("password123"), role="Admin")
        db.add(user)
        db.commit()
    db.close()

    login_res = client.post("/api/v1/auth/login", json={"username": "st_admin", "password": "password123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_pydantic_timezone_datetime_serialization():
    """Verify timezone-aware ISO datetime serialization across Pydantic schemas."""
    doc = IngestedDocument(filename="manual.pdf", file_type="pdf")
    assert doc.uploaded_at.tzinfo is not None, "Uploaded datetime must be timezone-aware UTC"

    sim_req = SimulationRequest(failed_asset="PUMP-101", failure_type="overheat")
    assert sim_req.timestamp is not None and "T" in sim_req.timestamp

def test_memory_serializer_and_timeline_builder():
    """Verify MemorySerializer and TimelineBuilder produce valid, crash-free objects."""
    from app.schemas.memory import StoreMemoryRequest
    req = StoreMemoryRequest(
        failed_asset="VALVE-202",
        failure_type="leak",
        decision_data={"strategy": "Isolate VALVE-202"},
        outcome="Resolved"
    )
    serializer = MemorySerializer()
    memory = serializer.serialize(req)
    assert isinstance(memory, IncidentMemory)
    assert memory.failed_asset == "VALVE-202"

    timeline_builder = TimelineBuilder()
    timeline = timeline_builder.build_timeline(memory)
    assert isinstance(timeline, list)
    assert len(timeline) >= 4

def test_no_circular_imports_or_missing_classes():
    """Verify every module under app can be dynamically imported without circular imports or AttributeError."""
    app_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app"))
    for root, dirs, files in os.walk(app_dir):
        for file in files:
            if file.endswith(".py") and not file.startswith("__"):
                rel_path = os.path.relpath(os.path.join(root, file), os.path.join(os.path.dirname(__file__), ".."))
                mod_name = rel_path.replace(".py", "").replace(os.sep, ".")
                mod = importlib.import_module(mod_name)
                assert mod is not None

def test_all_endpoints_runtime_stability(admin_headers):
    """Execute API routes with sample data to guarantee zero runtime crashes."""
    # Graph Build & Query
    build_payload = {
        "nodes": [{"node_id": "COMP-301", "asset_id": "COMP-301", "asset_type": "compressor", "status": "operational"}],
        "edges": []
    }
    res_build = client.post("/api/v1/graph/build", json=build_payload, headers=admin_headers)
    assert res_build.status_code == 201

    res_stats = client.get("/api/v1/graph/statistics", headers=admin_headers)
    assert res_stats.status_code == 200

    # Simulation Run
    sim_payload = {"failed_asset": "COMP-301", "failure_type": "seal_leak"}
    res_sim = client.post("/api/v1/simulation/run", json=sim_payload, headers=admin_headers)
    assert res_sim.status_code == 201
    sim_id = res_sim.json()["simulation_id"]

    # Decision Recommendation
    dec_payload = {"failed_asset": "COMP-301", "failure_type": "seal_leak", "simulation_id": sim_id}
    res_dec = client.post("/api/v1/decision/recommend", json=dec_payload, headers=admin_headers)
    assert res_dec.status_code == 200
    dec_data = res_dec.json()

    # Runbook Generation
    rb_payload = {"decision_payload": dec_data, "simulation_id": sim_id}
    res_rb = client.post("/api/v1/runbook/generate", json=rb_payload, headers=admin_headers)
    assert res_rb.status_code == 201
