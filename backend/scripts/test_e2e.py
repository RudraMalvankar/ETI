import io
import json
import os
import time

import requests

BASE_URL = "http://localhost:8000/api/v1"
DATA_FILE = "tests/samples/industrial_plant.json"


def measure_latency(func, *args, **kwargs):
    start = time.time()
    res = func(*args, **kwargs)
    return res, (time.time() - start) * 1000


def run_e2e():
    print("=======================================================")
    print("      END-TO-END APEX PIPELINE VERIFICATION")
    print("=======================================================")

    # 1-4. Upload, Parse, Extract, Chunk
    print("\n[1-4] Document Ingestion...")
    dummy_pdf = io.BytesIO(
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 51 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(APEX INDUSTRIAL INSPECTION REPORT\\nAsset ID: P-101\\nStatus: Critical Warning) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n313\n%%EOF"
    )
    files = {"file": ("test_report.pdf", dummy_pdf, "application/pdf")}
    res, lat = measure_latency(requests.post, f"{BASE_URL}/documents/upload", files=files)
    print(f"  Upload Latency: {lat:.2f}ms | Status: {res.status_code}")
    doc_id = res.json()["document_id"]

    # 5-6. Embeddings and Qdrant
    print("\n[5-6] Knowledge Indexing...")
    res, lat = measure_latency(
        requests.post, f"{BASE_URL}/documents/index", json={"document_id": doc_id}
    )
    print(f"  Index Latency: {lat:.2f}ms | Status: {res.status_code}")
    print(f"  Index Response: {res.json()}")

    # 7. Semantic Retrieval
    print("\n[7] Semantic Retrieval...")
    res, lat = measure_latency(
        requests.post, f"{BASE_URL}/search/", json={"query": "P-101 failure", "top_k": 2}
    )
    print(f"  Search Latency: {lat:.2f}ms | Status: {res.status_code}")
    search_data = res.json()
    print(f"  Retrieved {len(search_data['results'])} chunks.")

    # 8. Build Knowledge Graph
    print("\n[8] Graph Engine...")
    with open(DATA_FILE, "r") as f:
        graph_data = json.load(f)
    res, lat = measure_latency(requests.post, f"{BASE_URL}/graph/build", json=graph_data)
    print(f"  Graph Build Latency: {lat:.2f}ms | Status: {res.status_code}")
    print(f"  Graph Build Response: {res.json()}")

    # 9-11. Trigger Simulation
    print("\n[9-11] Shadow Simulation Engine...")
    req_sim = {"failed_asset": "P-101", "failure_type": "mechanical_failure"}
    res, lat = measure_latency(requests.post, f"{BASE_URL}/simulation/run", json=req_sim)
    print(f"  Simulation Latency: {lat:.2f}ms | Status: {res.status_code}")
    sim_data = res.json()
    sim_id = sim_data["simulation_id"]
    scenarios = sim_data["scenarios"]
    print(f"  Generated {len(scenarios)} scenarios.")
    for sc in scenarios:
        print(
            f"    - {sc['name']}: {len(sc['affected_assets'])} assets affected, Score: {sc['risk_score']['overall_score']}"
        )

    # 12-15. Decision Engine
    print("\n[12-15] Decision Engine...")
    req_dec = {
        "failed_asset": "P-101",
        "failure_type": "mechanical_failure",
        "simulation_id": sim_id,
    }
    res, lat = measure_latency(requests.post, f"{BASE_URL}/decision/recommend", json=req_dec)
    print(f"  Decision Latency: {lat:.2f}ms | Status: {res.status_code}")
    dec_data = res.json()
    print(f"  Confidence Score: {dec_data['confidence_score']}%")
    print(f"  Recommended Strategy: {dec_data['recommended_strategy']}")
    print(f"  Valid Citations: {len(dec_data['supporting_citations'])}")

    print("\n=======================================================")
    print("      E2E TEST COMPLETED SUCCESSFULLY")
    print("=======================================================")


if __name__ == "__main__":
    run_e2e()
