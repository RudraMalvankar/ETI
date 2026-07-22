import json

import requests

BASE_URL = "http://localhost:8000/api/v1"
DATA_FILE = "tests/samples/industrial_plant.json"


def run_test():
    print("--- APEX DYNAMIC RUNBOOK ENGINE DEMONSTRATION ---")

    # 1. Setup Graph, Simulation, Decision (mocked here directly via payload)
    mock_decision_payload = {
        "recommended_strategy": "Immediately isolate P-101 and apply manual override to upstream components.",
        "alternative_strategies": ["Proceed with planned maintenance window, risking propagation."],
        "reasoning": "Based on the Knowledge Graph simulation, leaving P-101 unmitigated will lead to cascading failure.",
        "supporting_citations": [
            {
                "document_id": "doc123",
                "chunk_id": "chunk456",
                "text_snippet": "P-101 failure protocol requires isolation.",
            }
        ],
        "confidence_score": 85.5,
        "affected_assets": ["P-101", "V-102", "L-14"],
        "estimated_risk_reduction": 80.5,
        "estimated_cost": 3000.0,
        "estimated_downtime": 2.5,
        "decision_trace": {
            "documents_used": 1,
            "graph_nodes_traversed": 3,
            "selected_scenario": "Best Case",
            "citations_verified": 1,
            "confidence": 85.5,
        },
    }

    # Generate Runbook
    req = {"decision_payload": mock_decision_payload, "simulation_id": "mock-sim-123"}
    print("\n1. Generating Initial Runbook...")
    res = requests.post(f"{BASE_URL}/runbook/generate", json=req)
    if res.status_code != 201:
        print(f"Failed to generate runbook: {res.text}")
        return

    rb = res.json()
    rb_id = rb["runbook_id"]
    print(f"Generated Runbook ID: {rb_id}")
    for i, step in enumerate(rb["steps"]):
        print(f"  Step {i+1}: {step['title']} (Asset: {step['target_asset']})")
        print(f"    - Tools: {step['required_tools']}")
        print(f"    - Safety: {step['safety_requirements']}")
        print(f"    - Status: {step['status']}")
        if step["document_citations"]:
            print(f"    - Citations attached: {len(step['document_citations'])}")

    # Mark first step as completed
    step_1_id = rb["steps"][0]["step_id"]
    print("\n2. Technician marks Step 1 as COMPLETED...")
    res = requests.put(
        f"{BASE_URL}/runbook/{rb_id}/step/{step_1_id}",
        json={"status": "completed", "feedback_notes": "Valves closed."},
    )
    rb = res.json()
    print(f"Step 1 Status: {rb['steps'][0]['status']}")

    # Mark second step as failed
    step_2_id = rb["steps"][1]["step_id"]
    print("\n3. Technician marks Step 2 as FAILED (triggering dynamic regeneration)...")
    res = requests.put(
        f"{BASE_URL}/runbook/{rb_id}/step/{step_2_id}",
        json={"status": "failed", "feedback_notes": "Valve is rusted shut, cannot isolate."},
    )
    rb = res.json()

    print(f"\n4. Reviewing Regenerated Runbook...")
    print(f"Runbook Status: {rb['status']}")
    print(f"Total Steps Now: {len(rb['steps'])}")
    for i, step in enumerate(rb["steps"]):
        status_flag = f"[{step['status'].upper()}]"
        print(f"  {status_flag} Step {i+1}: {step['title']}")
        if step["prerequisites"]:
            print(f"      Prereqs: {step['prerequisites']}")

    print("\n5. Runbook Statistics...")
    stats = requests.get(f"{BASE_URL}/runbook/statistics/")
    print(json.dumps(stats.json(), indent=2))


if __name__ == "__main__":
    run_test()
