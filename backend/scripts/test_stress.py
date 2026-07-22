import io
import json

import psutil
import requests

BASE_URL = "http://localhost:8000/api/v1"
DATA_FILE = "tests/samples/industrial_plant.json"


def print_test(name, res):
    print(f"{name:.<40} [Status: {res.status_code}]")
    if res.status_code >= 500:
        print(f"    ERROR: {res.text}")


def run_stress_tests():
    print("=======================================================")
    print("      APEX STRESS & NEGATIVE TESTING")
    print("=======================================================")

    # Invalid PDFs
    print("\n--- Document Ingestion Edge Cases ---")
    res = requests.post(
        f"{BASE_URL}/documents/upload",
        files={"file": ("invalid.txt", io.BytesIO(b"Not a PDF"), "text/plain")},
    )
    print_test("Invalid File Type (txt)", res)

    res = requests.post(
        f"{BASE_URL}/documents/upload",
        files={"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")},
    )
    print_test("Empty File", res)

    res = requests.post(
        f"{BASE_URL}/documents/upload",
        files={
            "file": (
                "corrupt.pdf",
                io.BytesIO(b"%PDF-1.4\ncorrupted content"),
                "application/pdf",
            )
        },
    )
    print_test("Corrupted PDF", res)

    # Empty/Unknown Indexing
    print("\n--- Indexing & Retrieval Edge Cases ---")
    res = requests.post(f"{BASE_URL}/documents/index", json={"document_id": "invalid-uuid"})
    print_test("Index Unknown Document", res)

    res = requests.post(f"{BASE_URL}/search/", json={"query": "nonexistent stuff", "top_k": 5})
    print_test("Search Empty Qdrant / No Match", res)

    # Graph Edge Cases
    print("\n--- Graph Engine Edge Cases ---")
    res = requests.post(f"{BASE_URL}/graph/build", json={"nodes": [], "edges": []})
    print_test("Build Empty Graph", res)

    res = requests.post(f"{BASE_URL}/graph/blast-radius", json={"failed_asset": "UNKNOWN-ASSET"})
    print_test("Blast Radius Unknown Asset", res)

    # Rebuild graph to valid state for next tests
    with open(DATA_FILE, "r") as f:
        graph_data = json.load(f)
    requests.post(f"{BASE_URL}/graph/build", json=graph_data)

    res = requests.get(f"{BASE_URL}/graph/path?source=P-101&target=M-101")
    print_test("Pathfinder (No Path Exists)", res)

    # Simulation Edge Cases
    print("\n--- Simulation Engine Edge Cases ---")
    res = requests.post(
        f"{BASE_URL}/simulation/run",
        json={"failed_asset": "UNKNOWN-PUMP", "failure_type": "explode"},
    )
    print_test("Simulate Unknown Asset", res)

    res = requests.get(f"{BASE_URL}/simulation/invalid-id")
    print_test("Fetch Missing Simulation", res)

    # Decision Engine Edge Cases
    print("\n--- Decision Engine Edge Cases ---")
    res = requests.post(
        f"{BASE_URL}/decision/recommend",
        json={
            "failed_asset": "P-101",
            "failure_type": "break",
            "simulation_id": "invalid-sim-id",
        },
    )
    print_test("Decision on Missing Simulation", res)

    # Memory Check
    print("\n--- System Health ---")
    process = psutil.Process()
    mem_info = process.memory_info()
    print(f"Test Script Memory: {mem_info.rss / 1024 / 1024:.2f} MB")

    print("\n=======================================================")
    print("      STRESS TEST COMPLETED")
    print("=======================================================")


if __name__ == "__main__":
    run_stress_tests()
