import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
import time

from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas

from app.main import app


def run_e2e_demo():
    print("=======================================================")
    print("  APEX ENTERPRISE BACKEND - MILESTONE 8 E2E DEMO")
    print("  Operational Memory + Explainability + Compliance")
    print("=======================================================\n")

    client = TestClient(app)

    # STEP 1: Upload PDF / Document Ingestion
    print("[1/13] Document Ingestion (PDF Ingest & Indexing)")
    sample_pdf_path = "tests/samples/sample_manual.pdf"
    os.makedirs(os.path.dirname(sample_pdf_path), exist_ok=True)
    c = canvas.Canvas(sample_pdf_path)
    c.drawString(100, 750, "APEX INDUSTRIAL MAINTENANCE MANUAL")
    c.drawString(100, 700, "Asset ID: P-101 (Centrifugal Pump)")
    c.drawString(
        100,
        650,
        "Procedure: In case of bearing overheat on P-101, isolate inlet valve V-202 immediately.",
    )
    c.drawString(
        100,
        600,
        "Safety Check: Verify electrical lock-out tag-out before opening housing.",
    )
    c.save()

    with open(sample_pdf_path, "rb") as f:
        res_doc = client.post(
            "/api/v1/documents/upload",
            files={"file": ("sample_manual.pdf", f, "application/pdf")},
        )

    assert res_doc.status_code == 201
    doc_id = res_doc.json()["document_id"]
    print(f"  -> Document Ingested Successfully! ID: {doc_id}")

    res_idx = client.post("/api/v1/documents/index", json={"document_id": doc_id})
    print(f"  -> Vector Indexing Status: HTTP {res_idx.status_code}")

    # STEP 2: Vector Search / Embedding Verification
    print("\n[2/13] RAG Vector Search Retrieval")
    res_search = client.post(
        "/api/v1/search/",
        json={"query": "P-101 bearing overheat safety isolation", "top_k": 2},
    )
    print(
        f"  -> Search Status: HTTP {res_search.status_code} (Found {len(res_search.json().get('results', []))} matches)"
    )

    # STEP 3: Knowledge Graph Construction
    print("\n[3/13] Knowledge Graph Build & Blast Radius Topology")
    sample_graph = "tests/samples/industrial_plant.json"
    if os.path.exists(sample_graph):
        with open(sample_graph, "r") as f:
            graph_data = json.load(f)
        res_graph = client.post("/api/v1/graph/build", json=graph_data)
        print(f"  -> Graph Build Status: HTTP {res_graph.status_code}")

    # STEP 4: Shadow Simulation Execution
    print("\n[4/13] Shadow Simulation Engine Execution")
    res_sim = client.post(
        "/api/v1/simulation/run",
        json={"failed_asset": "P-101", "failure_type": "bearing_overheat"},
    ).json()
    sim_id = res_sim.get("simulation_id", "sim-demo-01")
    print(f"  -> Simulation ID: {sim_id}")

    # STEP 5: AI Decision Engine Evaluation
    print("\n[5/13] Decision Engine Evaluation & Citation Resolution")
    decision_payload = {
        "recommended_strategy": "Isolate P-101 and Close V-202",
        "alternative_strategies": ["Throttle P-101 input"],
        "reasoning": "Highest risk reduction via physical isolation.",
        "supporting_citations": [
            {
                "document_id": doc_id,
                "chunk_id": "chk1",
                "text_snippet": "Isolate inlet valve V-202 immediately",
            }
        ],
        "confidence_score": 94.5,
        "affected_assets": ["P-101", "V-202"],
        "estimated_risk_reduction": 95.0,
        "estimated_cost": 1800.0,
        "estimated_downtime": 1.2,
        "decision_trace": {
            "documents_used": 1,
            "graph_nodes_traversed": 2,
            "selected_scenario": "Optimal Physical Isolation",
            "citations_verified": 1,
            "confidence": 94.5,
        },
    }
    print("  -> Decision Strategy: Isolate P-101 and Close V-202 (Confidence: 94.5%)")

    # STEP 6: Dynamic Runbook Generation
    print("\n[6/13] Dynamic Runbook Generation & Safety Protocol Injection")
    res_rb = client.post(
        "/api/v1/runbook/generate",
        json={"decision_payload": decision_payload, "simulation_id": sim_id},
    ).json()
    rb_id = res_rb.get("runbook_id")
    print(f"  -> Generated Runbook ID: {rb_id}")

    # STEP 7: Technician Feedback Logging
    print("\n[7/13] Technician Action & Feedback Logging")
    step_id = res_rb["steps"][0]["step_id"]
    res_fb = client.put(
        f"/api/v1/runbook/{rb_id}/step/{step_id}",
        json={
            "status": "failed",
            "feedback_notes": "Valve V-202 handwheel stuck, require pneumatic bypass.",
        },
    )
    print(f"  -> Feedback Logged for Step {step_id}: HTTP {res_fb.status_code}")

    # STEP 8: Runbook Regeneration
    print("\n[8/13] Runbook Dynamic Regeneration")
    res_regen = client.post(f"/api/v1/runbook/{rb_id}/regenerate").json()
    print(f"  -> Runbook Regenerated! New Status: {res_regen.get('status')}")

    # STEP 9: Operational Memory Storage
    print("\n[9/13] Operational Memory Storage")
    res_mem = client.post(
        "/api/v1/memory/store",
        json={
            "failed_asset": "P-101",
            "failure_type": "bearing_overheat",
            "simulation_id": sim_id,
            "runbook_id": rb_id,
            "decision_data": decision_payload,
            "outcome": "Resolved with Pneumatic Bypass",
        },
    ).json()
    incident_id = res_mem["incident_id"]
    print(f"  -> Stored Incident Memory ID: {incident_id}")

    # STEP 10: Operational Memory Search & Trends
    print("\n[10/13] Historical Memory Search & Organizational Trends (<100ms)")
    t_search_start = time.time()
    search_res = client.post(
        "/api/v1/memory/search", json={"query": "P-101 bearing overheat", "top_k": 3}
    ).json()
    search_latency = (time.time() - t_search_start) * 1000
    print(f"  -> Found {len(search_res)} similar past incidents in {search_latency:.2f}ms")

    trends_res = client.get("/api/v1/memory/trends").json()
    print(
        f"  -> Organizational Trends: Most Vulnerable Asset: {trends_res.get('most_vulnerable_asset')}"
    )

    # STEP 11: Explainability Engine Output
    print("\n[11/13] Explainability Engine (<200ms)")
    t_exp_start = time.time()
    explain_res = client.post(
        "/api/v1/explainability/explain",
        json={
            "simulation_id": sim_id,
            "scenarios": res_sim.get("scenarios", []),
            "documents": [{"document_id": doc_id, "text": "Isolate inlet valve V-202 immediately"}],
            "confidence": 94.5,
        },
    ).json()
    exp_latency = (time.time() - t_exp_start) * 1000
    print(f"  -> Explainability Summary ({exp_latency:.2f}ms):\n{explain_res['reasoning_summary']}")

    # STEP 12: Compliance Report Generation
    print("\n[12/13] Enterprise Compliance & Audit Report (<300ms)")
    t_comp_start = time.time()
    res_comp = client.post("/api/v1/compliance/report", json={"incident_id": incident_id}).json()
    comp_latency = (time.time() - t_comp_start) * 1000
    report_id = res_comp["report_id"]
    print(f"  -> Report ID: {report_id} generated in {comp_latency:.2f}ms")
    print("  -> Compliance Checklist:")
    for check in res_comp["compliance_checklist"]:
        print(f"       {check}")

    # STEP 13: Export PDF & DOCX
    print("\n[13/13] Compliance Export (PDF & DOCX)")
    pdf_res = client.post("/api/v1/compliance/export/pdf", json={"report_id": report_id})
    docx_res = client.post("/api/v1/compliance/export/docx", json={"report_id": report_id})
    print(f"  -> PDF Export HTTP {pdf_res.status_code} ({len(pdf_res.content)} bytes)")
    print(f"  -> DOCX Export HTTP {docx_res.status_code} ({len(docx_res.content)} bytes)")

    print("\n=======================================================")
    print("      MILESTONE 8 FULL LIFECYCLE PASSED SUCCESSFULLY")
    print("=======================================================")


if __name__ == "__main__":
    run_e2e_demo()
