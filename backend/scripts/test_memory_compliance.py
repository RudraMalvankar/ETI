import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"
DATA_FILE = "tests/samples/industrial_plant.json"

def run_test():
    print("--- APEX MILESTONE 8 DEMONSTRATION ---")
    print("Operational Memory + Explainability + Compliance Engine\n")
    
    # 1. Complete incident lifecycle setup
    print("[1/6] Setting up Incident Lifecycle (Graph -> Simulation -> Decision -> Runbook)")
    with open(DATA_FILE, 'r') as f:
        graph_data = json.load(f)
    requests.post(f"{BASE_URL}/graph/build", json=graph_data)
    
    res_sim = requests.post(f"{BASE_URL}/simulation/run", json={"failed_asset": "P-101", "failure_type": "mechanical_failure"}).json()
    sim_id = res_sim['simulation_id']
    
    # Mocking Decision for simplicity to skip Qdrant dependencies in the script
    mock_decision_payload = {
        "recommended_strategy": "Isolate P-101",
        "alternative_strategies": [],
        "reasoning": "Highest risk.",
        "supporting_citations": [{"document_id": "doc1", "chunk_id": "chk1", "text_snippet": "Ensure isolation"}],
        "confidence_score": 90.0,
        "affected_assets": ["P-101"],
        "estimated_risk_reduction": 95.0,
        "estimated_cost": 2000.0,
        "estimated_downtime": 1.0,
        "decision_trace": {
            "documents_used": 1,
            "graph_nodes_traversed": 1,
            "selected_scenario": "Best Case",
            "citations_verified": 1,
            "confidence": 90.0
        }
    }
    
    res_rb = requests.post(f"{BASE_URL}/runbook/generate", json={
        "decision_payload": mock_decision_payload, 
        "simulation_id": sim_id
    }).json()
    rb_id = res_rb['runbook_id']
    
    print(f"  Simulation ID: {sim_id}")
    print(f"  Runbook ID: {rb_id}")
    
    # Simulate technician feedback
    step_id = res_rb['steps'][0]['step_id']
    requests.put(f"{BASE_URL}/runbook/{rb_id}/step/{step_id}", json={"status": "completed", "feedback_notes": "Done"})
    print("  Technician feedback logged.")
    
    # 2 & 3. Store and Retrieve Memory
    print("\n[2/6] Operational Memory Storage & Retrieval")
    res_mem = requests.post(f"{BASE_URL}/memory/store", json={
        "failed_asset": "P-101",
        "failure_type": "mechanical_failure",
        "simulation_id": sim_id,
        "runbook_id": rb_id
    }).json()
    
    incident_id = res_mem['incident_id']
    print(f"  Incident Stored! Memory ID: {incident_id}")
    
    print("\n[3/6] Similar Incident Search & Trends")
    search = requests.post(f"{BASE_URL}/memory/search", json={"query": "pump mechanical P-101", "top_k": 3}).json()
    print(f"  Found {len(search)} similar past incidents.")
    
    trends = requests.get(f"{BASE_URL}/memory/trends").json()
    print(f"  Organizational Trend: Most common failure -> {trends.get('most_common_failure_type')}")
    
    # 4. Explainability (Decision Trace)
    print("\n[4/6] Decision Explainability Engine")
    explain_context = {
        "simulation_id": sim_id,
        "scenarios": res_sim['scenarios'],
        "documents": [{"document_id": "doc1", "chunk_id": "chk1", "text": "Isolate the pump before proceeding."}]
    }
    res_exp = requests.post(f"{BASE_URL}/explainability/explain", json=explain_context).json()
    print(f"  Reasoning Summary:\n    {res_exp['reasoning_summary']}")
    
    # 5 & 6. Compliance Report & Audit Timeline
    print("\n[5/6] Compliance Report Generation")
    res_comp_req = requests.post(f"{BASE_URL}/compliance/report", json={"incident_id": incident_id})
    if res_comp_req.status_code != 201:
        print(f"  Error: {res_comp_req.status_code} - {res_comp_req.text}")
    res_comp = res_comp_req.json()
    report_id = res_comp['report_id']
    print(f"  Compliance Report ID: {report_id}")
    print(f"  Compliance Checklist:")
    for check in res_comp['compliance_checklist']:
        print(f"    {check}")
        
    print("\n[6/6] Audit Timeline Generation")
    print("  Chronological Events:")
    for event in res_comp['timeline']:
        print(f"    [{event['time']}] {event['event']}")

    # Export
    print("\n  Exporting Report...")
    pdf = requests.post(f"{BASE_URL}/compliance/export/pdf", json={"report_id": report_id})
    print(f"  PDF Export Status: {pdf.status_code}")
    
    print("\n=======================================================")
    print("      MILESTONE 8 COMPLETED SUCCESSFULLY")
    print("=======================================================")

if __name__ == "__main__":
    run_test()
