import os
import sys
import traceback
import warnings

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.abspath("."))

try:
    from fastapi.testclient import TestClient

    from app.core.auth import get_password_hash
    from app.database.session import SessionLocal
    from app.main import app
    from app.models.models import UserModel

    client = TestClient(app)

    print("--- Starting Runtime & Endpoint Audit ---")

    db = SessionLocal()
    admin = db.query(UserModel).filter(UserModel.username == "audit_admin").first()
    if not admin:
        admin = UserModel(
            username="audit_admin", hashed_password=get_password_hash("password123"), role="Admin"
        )
        db.add(admin)
        db.commit()
    db.close()

    login_res = client.post(
        "/api/v1/auth/login", json={"username": "audit_admin", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    endpoints_tested = 0
    endpoint_errors = []

    def test_ep(method, url, json_body=None, expected_status=200):
        global endpoints_tested
        endpoints_tested += 1
        try:
            if method == "GET":
                res = client.get(url, headers=headers)
            elif method == "POST":
                res = client.post(url, json=json_body, headers=headers)
            elif method == "PUT":
                res = client.put(url, json=json_body, headers=headers)
            elif method == "DELETE":
                res = client.delete(url, headers=headers)

            exp_list = (
                expected_status if isinstance(expected_status, (list, tuple)) else [expected_status]
            )
            if res.status_code not in exp_list:
                endpoint_errors.append(
                    f"{method} {url} returned {res.status_code} (expected {expected_status}): {res.text}"
                )
            else:
                print(f"OK: {method} {url} -> {res.status_code}")
        except Exception as e:
            endpoint_errors.append(f"EXCEPT {method} {url}: {e}\n{traceback.format_exc()}")

    # 1. Auth
    test_ep("GET", "/api/v1/auth/me", expected_status=200)

    # 2. Documents
    test_ep("GET", "/api/v1/documents/", expected_status=200)

    # 3. Graph
    graph_build_body = {
        "nodes": [
            {"node_id": "PUMP-101", "name": "Main Pump", "type": "pump", "status": "active"},
            {"node_id": "VALVE-202", "name": "Inlet Valve", "type": "valve", "status": "active"},
        ],
        "edges": [{"source": "VALVE-202", "target": "PUMP-101", "relationship_type": "feeds"}],
    }
    test_ep("POST", "/api/v1/graph/build", json_body=graph_build_body, expected_status=201)
    test_ep("GET", "/api/v1/graph/", expected_status=200)
    test_ep("GET", "/api/v1/graph/node/PUMP-101", expected_status=200)
    test_ep("GET", "/api/v1/graph/neighbors/PUMP-101", expected_status=200)
    test_ep(
        "POST",
        "/api/v1/graph/blast-radius",
        json_body={"failed_asset": "PUMP-101"},
        expected_status=200,
    )
    test_ep("GET", "/api/v1/graph/path?source=VALVE-202&target=PUMP-101", expected_status=200)
    test_ep("GET", "/api/v1/graph/statistics", expected_status=200)

    # 4. Simulation
    sim_req = {"failed_asset": "PUMP-101", "failure_mode": "bearing_overheat", "severity": "high"}
    test_ep("POST", "/api/v1/simulation/run", json_body=sim_req, expected_status=201)

    # 5. Decision
    dec_req = {
        "failed_asset": "PUMP-101",
        "failure_type": "bearing_overheat",
        "operational_context": "High load continuous operation",
    }
    test_ep("POST", "/api/v1/decision/recommend", json_body=dec_req, expected_status=200)

    # 6. Runbook
    rb_req = {
        "failed_asset": "PUMP-101",
        "failure_type": "bearing_overheat",
        "decision_id": "dec-101",
    }
    test_ep("POST", "/api/v1/runbook/generate", json_body=rb_req, expected_status=201)
    test_ep("GET", "/api/v1/runbook/statistics/", expected_status=200)

    # 7. Memory
    mem_store = {
        "failed_asset": "PUMP-101",
        "failure_type": "bearing_overheat",
        "simulation_id": "sim-101",
        "runbook_id": "rb-101",
        "decision_data": {"strategy": "Isolate"},
        "outcome": "Resolved",
    }
    test_ep("POST", "/api/v1/memory/store", json_body=mem_store, expected_status=201)
    test_ep("GET", "/api/v1/memory/incidents", expected_status=200)
    test_ep("GET", "/api/v1/memory/trends", expected_status=200)
    test_ep(
        "POST",
        "/api/v1/memory/search",
        json_body={"query": "PUMP-101", "top_k": 5},
        expected_status=200,
    )

    # 8. Explainability
    exp_req = {
        "simulation_id": "sim-101",
        "scenarios": [
            {"name": "Isolation", "affected_assets": ["PUMP-101"], "estimated_downtime_hours": 1.0}
        ],
        "documents": [],
        "confidence": 95.0,
    }
    test_ep("POST", "/api/v1/explainability/explain", json_body=exp_req, expected_status=200)

    # 9. Audit
    test_ep("GET", "/api/v1/audit/", expected_status=200)

    print(f"\n--- Summary: Endpoints Tested={endpoints_tested}, Errors={len(endpoint_errors)} ---")
    if endpoint_errors:
        print("ERRORS FOUND:")
        for err in endpoint_errors:
            print(err)

except Exception as fatal_e:
    print(f"FATAL AUDIT SCRIPT ERROR: {fatal_e}")
    traceback.print_exc()

sys.exit(0)
