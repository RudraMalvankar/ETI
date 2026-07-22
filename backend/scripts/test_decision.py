import json
import os

import requests

BASE_URL_GRAPH = "http://localhost:8000/api/v1/graph"
BASE_URL_SIM = "http://localhost:8000/api/v1/simulation"
BASE_URL_DECISION = "http://localhost:8000/api/v1/decision"
DATA_FILE = "tests/samples/industrial_plant.json"


def run_test():
    print("--- APEX DECISION ENGINE DEMONSTRATION ---")

    # 1. Build a graph from mock industrial assets
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    requests.post(f"{BASE_URL_GRAPH}/build", json=data)
    print("Graph built.")

    # Mocking Qdrant context by uploading a manual (simulate document ingestion)
    # We will just assume it's empty if no document, the mock retriever will handle it.

    incidents = [
        {"asset": "P-101", "type": "mechanical_failure", "name": "Pump"},
        {"asset": "V-102", "type": "pressure_leak", "name": "Valve"},
        {"asset": "HX-3", "type": "thermal_overload", "name": "Heat Exchanger"},
    ]

    for inc in incidents:
        print(f"\n=======================================================")
        print(f"Triggering Decision Engine for: {inc['name']} ({inc['asset']})")
        print(f"=======================================================")

        # Step A: Run Shadow Simulation
        req_sim = {"failed_asset": inc["asset"], "failure_type": inc["type"]}
        sim_res = requests.post(f"{BASE_URL_SIM}/run", json=req_sim)
        if sim_res.status_code != 201:
            print(f"Failed to simulate: {sim_res.text}")
            continue

        sim_data = sim_res.json()
        sim_id = sim_data["simulation_id"]
        print(
            f"Shadow Simulation completed (ID: {sim_id}). Scenarios generated: {len(sim_data['scenarios'])}"
        )

        # Step B: Request Decision
        req_dec = {
            "failed_asset": inc["asset"],
            "failure_type": inc["type"],
            "simulation_id": sim_id,
        }
        dec_res = requests.post(f"{BASE_URL_DECISION}/recommend", json=req_dec)

        if dec_res.status_code != 200:
            print(f"Failed to generate decision: {dec_res.text}")
            continue

        decision = dec_res.json()

        print("\n[AI DECISION]")
        print(f"Confidence Score: {decision['confidence_score']}%")
        print(f"Recommended Strategy: {decision['recommended_strategy']}")
        print(f"Reasoning: {decision['reasoning']}")
        print(f"Alternative Strategies: {decision['alternative_strategies']}")
        print(f"Estimated Cost: ${decision['estimated_cost']}")
        print(f"Estimated Downtime: {decision['estimated_downtime']} hours")
        print(f"Affected Assets: {decision['affected_assets']}")
        if decision["supporting_citations"]:
            print(
                f"Citations: {len(decision['supporting_citations'])} retrieved document chunks validated."
            )
        else:
            print("Citations: 0 retrieved document chunks validated.")


if __name__ == "__main__":
    run_test()
