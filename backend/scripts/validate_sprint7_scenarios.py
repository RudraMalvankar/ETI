"""
APEX Sprint 7 — Industrial Scenario Validation Harness
Executes 10 realistic industrial failure scenarios against the APEX FastAPI backend:
1. Pump bearing overheating (P-101)
2. Compressor vibration anomaly (C-302)
3. Boiler pressure increase (B-501)
4. Valve leakage (V-102)
5. Heat exchanger fouling (HX-204)
6. Cooling tower failure (CT-101)
7. Turbine lubrication loss (ST-801)
8. Electrical panel overheating (MCC-4)
9. Conveyor motor overload (CV-701)
10. Pipeline pressure drop (PL-902)
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from app.database.session import Base, SessionLocal, engine
from app.main import app
from app.models.models import UserModel

SCENARIOS = [
    {
        "id": 1,
        "name": "Pump Bearing Overheating",
        "asset": "P-101",
        "type": "bearing_overheat",
        "telemetry": {"temperature": 98.5, "vibration": 4.2},
        "query": "P-101 bearing temperature threshold emergency procedure",
        "sop_doc": "SOP-P101-BEARING.pdf",
    },
    {
        "id": 2,
        "name": "Compressor Vibration Anomaly",
        "asset": "C-302",
        "type": "vibration_unbalance",
        "telemetry": {"vibration": 14.2, "pressure": 12.0},
        "query": "C-302 compressor axial vibration isolation manual",
        "sop_doc": "SOP-C302-VIB.pdf",
    },
    {
        "id": 3,
        "name": "Boiler Pressure Increase",
        "asset": "B-501",
        "type": "overpressure_surge",
        "telemetry": {"pressure": 22.4, "temperature": 340.0},
        "query": "B-501 steam drum safety relief valve procedure",
        "sop_doc": "SOP-B501-BOILER.pdf",
    },
    {
        "id": 4,
        "name": "Valve Leakage",
        "asset": "V-102",
        "type": "stem_seal_leak",
        "telemetry": {"flow": 3.4, "pressure": 15.0},
        "query": "V-102 emergency stem seal isolation LOTO protocol",
        "sop_doc": "SOP-V102-VALVE.pdf",
    },
    {
        "id": 5,
        "name": "Heat Exchanger Fouling",
        "asset": "HX-204",
        "type": "thermal_fouling",
        "telemetry": {"delta_p": 4.1, "temperature_out": 65.0},
        "query": "HX-204 shell tube heat exchanger cleaning bypass",
        "sop_doc": "SOP-HX204-CLEAN.pdf",
    },
    {
        "id": 6,
        "name": "Cooling Tower Failure",
        "asset": "CT-101",
        "type": "fan_motor_trip",
        "telemetry": {"water_temp": 42.0, "fan_rpm": 0.0},
        "query": "CT-101 induced draft cooling tower fan trip recovery",
        "sop_doc": "SOP-CT101-TOWER.pdf",
    },
    {
        "id": 7,
        "name": "Turbine Lubrication Loss",
        "asset": "ST-801",
        "type": "lube_oil_low_pressure",
        "telemetry": {"oil_pressure": 0.8, "rpm": 3000.0},
        "query": "ST-801 steam turbine lube oil trip override",
        "sop_doc": "SOP-ST801-LUBE.pdf",
    },
    {
        "id": 8,
        "name": "Electrical Panel Overheating",
        "asset": "MCC-4",
        "type": "busbar_hotspot",
        "telemetry": {"busbar_temp": 115.0, "current": 850.0},
        "query": "MCC-4 switchgear panel thermal fault arc flash safety",
        "sop_doc": "SOP-MCC4-ELEC.pdf",
    },
    {
        "id": 9,
        "name": "Conveyor Motor Overload",
        "asset": "CV-701",
        "type": "jam_current_overload",
        "telemetry": {"current": 145.0, "belt_speed": 0.0},
        "query": "CV-701 conveyor belt jam clear safety lock",
        "sop_doc": "SOP-CV701-CONVEYOR.pdf",
    },
    {
        "id": 10,
        "name": "Pipeline Pressure Drop",
        "asset": "PL-902",
        "type": "flange_microfracture_leak",
        "telemetry": {"pressure": 2.1, "flow_rate": 120.0},
        "query": "PL-902 pipeline pressure drop flange containment protocol",
        "sop_doc": "SOP-PL902-PIPE.pdf",
    },
]


def run_validation_suite():
    results = []
    print("=" * 80)
    print("APEX SPRINT 7 — REAL WORLD INDUSTRIAL SCENARIO VALIDATION HARNESS")
    print("=" * 80)

    Base.metadata.create_all(bind=engine)

    client = TestClient(app, raise_server_exceptions=True)

    # 1. Login & Token Setup with Engineer role
    client.post(
        "/api/v1/auth/register",
        json={"username": "s7_engineer", "password": "Eng1neer2026!"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "s7_engineer", "password": "Eng1neer2026!"},
    )
    assert login_resp.status_code == 200, "Login failed"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Admin & Auditor tokens for RBAC endpoints
    client.post(
        "/api/v1/auth/register", json={"username": "s7_admin_user", "password": "Adm1n2026!Pass"}
    )
    login_admin = client.post(
        "/api/v1/auth/login", json={"username": "s7_admin_user", "password": "Adm1n2026!Pass"}
    )
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    client.post(
        "/api/v1/auth/register",
        json={"username": "s7_auditor_user", "password": "Aud1tor2026!Pass"},
    )
    login_auditor = client.post(
        "/api/v1/auth/login", json={"username": "s7_auditor_user", "password": "Aud1tor2026!Pass"}
    )
    auditor_token = login_auditor.json()["access_token"]
    auditor_headers = {"Authorization": f"Bearer {auditor_token}"}

    db = SessionLocal()
    u_eng = db.query(UserModel).filter(UserModel.username == "s7_engineer").first()
    if u_eng:
        u_eng.role = "Engineer"
    u_admin = db.query(UserModel).filter(UserModel.username == "s7_admin_user").first()
    if u_admin:
        u_admin.role = "Admin"
    u_auditor = db.query(UserModel).filter(UserModel.username == "s7_auditor_user").first()
    if u_auditor:
        u_auditor.role = "Auditor"
    db.commit()
    db.close()

    # 2. Build Graph Topology using Admin Headers
    graph_payload = {
        "nodes": [
            {
                "node_id": s["asset"],
                "asset_id": s["asset"],
                "asset_type": "IndustrialAsset",
                "status": "operational",
                "criticality": "high",
            }
            for s in SCENARIOS
        ],
        "edges": [
            {
                "edge_id": f"e_{i}",
                "source": SCENARIOS[i]["asset"],
                "target": SCENARIOS[(i + 1) % 10]["asset"],
                "relationship": "feeds",
                "weight": 1.0,
                "risk_factor": 0.8,
            }
            for i in range(9)
        ],
    }
    client.post("/api/v1/graph/build", json=graph_payload, headers=admin_headers)

    # 3. Execute 10 Scenarios
    for sc in SCENARIOS:
        print(f"\n[Scenario {sc['id']}/10] Testing: {sc['name']} ({sc['asset']})")
        scenario_result = {
            "id": sc["id"],
            "name": sc["name"],
            "asset": sc["asset"],
            "steps_passed": 0,
            "total_steps": 10,
            "status": "FAIL",
            "logs": [],
        }

        try:
            # Step 1: Health Check
            res = client.get("/health")
            if res.status_code == 200 and res.json()["status"] == "ok":
                scenario_result["steps_passed"] += 1

            # Step 2: RAG Search
            search_res = client.post(
                "/api/v1/search/", json={"query": sc["query"], "top_k": 3}, headers=headers
            )
            if search_res.status_code == 200 and "results" in search_res.json():
                scenario_result["steps_passed"] += 1

            # Step 3: Graph Blast Radius
            blast_res = client.post(
                "/api/v1/graph/blast-radius", json={"failed_asset": sc["asset"]}, headers=headers
            )
            if blast_res.status_code in (200, 404):
                scenario_result["steps_passed"] += 1

            # Step 4: Shadow Simulation
            sim_res = client.post(
                "/api/v1/simulation/run",
                json={
                    "failed_asset": sc["asset"],
                    "failure_type": sc["type"],
                    "initial_telemetry": sc["telemetry"],
                    "operating_mode": "normal",
                },
                headers=headers,
            )
            if sim_res.status_code == 201:
                sim_data = sim_res.json()
                sim_id = sim_data["simulation_id"]
                scenario_result["steps_passed"] += 1
            else:
                sim_id = f"sim_mock_{sc['id']}"

            # Step 5: AI Decision Recommendation
            dec_res = client.post(
                "/api/v1/decision/recommend",
                json={
                    "failed_asset": sc["asset"],
                    "failure_type": sc["type"],
                    "simulation_id": sim_id,
                },
                headers=headers,
            )
            if dec_res.status_code == 200:
                dec_data = dec_res.json()
                scenario_result["steps_passed"] += 1
            else:
                dec_data = {
                    "recommended_strategy": f"Isolate {sc['asset']}",
                    "confidence_score": 92.5,
                }

            # Step 6: Explainability Trace
            exp_res = client.post(
                "/api/v1/explainability/explain",
                json={
                    "failed_asset": sc["asset"],
                    "failure_type": sc["type"],
                    "simulation_id": sim_id,
                    "recommended_strategy": dec_data.get("recommended_strategy", "Isolate"),
                    "confidence_score": dec_data.get("confidence_score", 90.0),
                },
                headers=headers,
            )
            if exp_res.status_code == 200:
                scenario_result["steps_passed"] += 1

            # Step 7: Runbook Generation & Execution
            rb_res = client.post(
                "/api/v1/runbook/generate",
                json={"simulation_id": sim_id, "decision_payload": dec_data},
                headers=headers,
            )
            if rb_res.status_code == 201:
                rb_data = rb_res.json()
                rb_id = rb_data["runbook_id"]
                scenario_result["steps_passed"] += 1
                # Execute step feedback loop
                step_id = rb_data["steps"][0]["step_id"]
                client.put(
                    f"/api/v1/runbook/{rb_id}/step/{step_id}",
                    json={
                        "status": "completed",
                        "feedback_notes": f"Step executed for {sc['asset']}",
                    },
                    headers=headers,
                )
            else:
                rb_id = f"rb_mock_{sc['id']}"

            # Step 8: Memory Store
            mem_res = client.post(
                "/api/v1/memory/store",
                json={
                    "failed_asset": sc["asset"],
                    "failure_type": sc["type"],
                    "simulation_id": sim_id,
                    "runbook_id": rb_id,
                    "outcome": "Resolved",
                },
                headers=headers,
            )
            if mem_res.status_code == 201:
                inc_id = mem_res.json()["incident_id"]
                scenario_result["steps_passed"] += 1
            else:
                inc_id = f"inc_mock_{sc['id']}"

            # Step 9: Compliance Report & PDF Export
            comp_res = client.post(
                "/api/v1/compliance/report", json={"incident_id": inc_id}, headers=auditor_headers
            )
            if comp_res.status_code == 201:
                scenario_result["steps_passed"] += 1

            # Step 10: Audit Log Verification
            audit_res = client.get("/api/v1/audit/", headers=auditor_headers)
            if audit_res.status_code == 200:
                scenario_result["steps_passed"] += 1

            if scenario_result["steps_passed"] == 10:
                scenario_result["status"] = "PASS"

        except Exception as e:
            scenario_result["logs"].append(str(e))

        results.append(scenario_result)
        print(
            f"   -> Result: {scenario_result['status']} ({scenario_result['steps_passed']}/10 steps succeeded)"
        )

    print("\n" + "=" * 80)
    print("SUMMARY RESULTS:")
    passed_count = sum(1 for r in results if r["status"] == "PASS")
    print(f"Passed Scenarios: {passed_count}/10")
    print("=" * 80)
    return results


if __name__ == "__main__":
    run_validation_suite()
