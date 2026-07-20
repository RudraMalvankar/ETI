import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_operational_memory_lifecycle():
    # 1. Store incident
    payload = {
        "failed_asset": "PUMP-101",
        "failure_type": "bearing_overheat",
        "simulation_id": "sim-test-101",
        "runbook_id": "rb-test-101",
        "decision_data": {
            "recommended_strategy": "Isolate PUMP-101",
            "confidence_score": 95.0
        },
        "outcome": "Resolved"
    }
    
    start_time = time.time()
    res_store = client.post("/api/v1/memory/store", json=payload)
    assert res_store.status_code == 201
    data = res_store.json()
    incident_id = data["incident_id"]
    assert data["failed_asset"] == "PUMP-101"
    assert data["failure_type"] == "bearing_overheat"
    
    # 2. Get single incident
    res_get = client.get(f"/api/v1/memory/{incident_id}")
    assert res_get.status_code == 200
    assert res_get.json()["incident_id"] == incident_id

    # 3. Get all incidents
    res_all = client.get("/api/v1/memory/incidents")
    assert res_all.status_code == 200
    assert len(res_all.json()) >= 1

    # 4. Similar incident search (<100ms requirement)
    start_search = time.time()
    res_search = client.post("/api/v1/memory/search", json={"query": "PUMP-101 overheat", "top_k": 3})
    search_latency_ms = (time.time() - start_search) * 1000
    assert res_search.status_code == 200
    assert len(res_search.json()) >= 1
    assert search_latency_ms < 100.0, f"Memory search latency {search_latency_ms:.2f}ms exceeded 100ms threshold"

    # 5. Get organizational trends
    res_trends = client.get("/api/v1/memory/trends")
    assert res_trends.status_code == 200
    trends = res_trends.json()
    assert "total_incidents" in trends
    assert "most_common_failure_type" in trends
    assert "most_vulnerable_asset" in trends

def test_explainability_engine():
    explain_payload = {
        "simulation_id": "sim-test-101",
        "scenarios": [
            {
                "name": "Controlled Isolation",
                "affected_assets": ["PUMP-101", "VALVE-202"],
                "estimated_downtime_hours": 1.5,
                "estimated_cost_usd": 1500.0
            }
        ],
        "documents": [
            {
                "document_id": "DOC-MANUAL-01",
                "text": "Before maintenance on PUMP-101, isolate inlet valve VALVE-202."
            }
        ],
        "confidence": 92.5
    }

    start_explain = time.time()
    res_explain = client.post("/api/v1/explainability/explain", json=explain_payload)
    explain_latency_ms = (time.time() - start_explain) * 1000
    assert res_explain.status_code == 200
    explain_data = res_explain.json()

    assert "decision_trace" in explain_data
    assert "graph_evidence" in explain_data
    assert "simulation_evidence" in explain_data
    assert "document_evidence" in explain_data
    assert "reasoning_summary" in explain_data
    assert explain_data["decision_trace"]["confidence"] == 92.5
    assert explain_latency_ms < 200.0, f"Explainability latency {explain_latency_ms:.2f}ms exceeded 200ms threshold"

def test_compliance_engine():
    # Store incident to generate compliance report from
    mem_payload = {
        "failed_asset": "COMPRESSOR-301",
        "failure_type": "seal_leak",
        "simulation_id": "sim-comp-301",
        "runbook_id": "rb-comp-301",
        "outcome": "Resolved"
    }
    res_mem = client.post("/api/v1/memory/store", json=mem_payload)
    incident_id = res_mem.json()["incident_id"]

    # 1. Generate Compliance Report (<300ms requirement)
    start_comp = time.time()
    res_report = client.post("/api/v1/compliance/report", json={"incident_id": incident_id})
    comp_latency_ms = (time.time() - start_comp) * 1000
    assert res_report.status_code == 201
    report = res_report.json()
    report_id = report["report_id"]

    # Check 11 required audit fields
    fields = [
        "report_id", "incident_summary", "root_cause", "timeline",
        "graph_snapshot", "simulation_results", "decision_trace",
        "supporting_evidence", "runbook_history", "technician_actions",
        "compliance_checklist", "final_resolution"
    ]
    for f in fields:
        assert f in report, f"Missing compliance field: {f}"

    assert comp_latency_ms < 300.0, f"Compliance report latency {comp_latency_ms:.2f}ms exceeded 300ms threshold"

    # 2. Get report by ID
    res_get = client.get(f"/api/v1/compliance/{report_id}")
    assert res_get.status_code == 200
    assert res_get.json()["report_id"] == report_id

    # 3. Export PDF
    res_pdf = client.post("/api/v1/compliance/export/pdf", json={"report_id": report_id})
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 0

    # 4. Export DOCX
    res_docx = client.post("/api/v1/compliance/export/docx", json={"report_id": report_id})
    assert res_docx.status_code == 200
    assert "wordprocessingml" in res_docx.headers["content-type"]
    assert len(res_docx.content) > 0
