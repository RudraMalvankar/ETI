import json

import requests

BASE_URL_GRAPH = "http://localhost:8000/api/v1/graph"
BASE_URL_SIM = "http://localhost:8000/api/v1/simulation"
DATA_FILE = "tests/samples/industrial_plant.json"


def print_scenario_summary(scenario):
    print(f"\n   Scenario: {scenario['name']}")
    print(
        f"   Affected Assets: {len(scenario['affected_assets'])} -> {scenario['affected_assets']}"
    )
    print(f"   Safety Level: {scenario['safety_level']}")
    print(
        f"   Downtime: {scenario['estimated_downtime_hours']} hrs | Cost: ${scenario['estimated_cost_usd']}"
    )
    risk = scenario["risk_score"]
    print(
        f"   Risk -> Safety: {risk['safety_risk']}, Ops: {risk['operational_risk']}, Fin: {risk['financial_risk']}, Env: {risk['environmental_risk']} | OVERALL: {risk['overall_score']}"
    )


def run_test():
    print("--- APEX SHADOW SIMULATION ENGINE DEMONSTRATION ---")

    # Ensure Graph is built first
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    requests.post(f"{BASE_URL_GRAPH}/build", json=data)

    incidents = [
        {"asset": "P-101", "type": "mechanical_failure", "name": "Pump"},
        {"asset": "V-102", "type": "pressure_leak", "name": "Valve"},
        {"asset": "HX-3", "type": "thermal_overload", "name": "Heat Exchanger"},
    ]

    for inc in incidents:
        print("\n=======================================================")
        print(f"Simulating Incident: {inc['name']} ({inc['asset']}) Failure [{inc['type']}]")
        print("=======================================================")

        req = {"failed_asset": inc["asset"], "failure_type": inc["type"]}

        sim_res = requests.post(f"{BASE_URL_SIM}/run", json=req)
        if sim_res.status_code != 201:
            print(f"Failed to simulate: {sim_res.text}")
            continue

        data = sim_res.json()
        print(f"Simulation ID: {data['simulation_id']}")

        for sc in data["scenarios"]:
            print_scenario_summary(sc)

    print("\n=======================================================")
    print("Simulation Statistics")
    print("=======================================================")
    stats_res = requests.get(f"{BASE_URL_SIM}/statistics/")
    print(json.dumps(stats_res.json(), indent=2))


if __name__ == "__main__":
    run_test()
