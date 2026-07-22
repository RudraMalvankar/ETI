import json
import os
import time

import requests

BASE_URL = "http://localhost:8000/api/v1/graph"
DATA_FILE = "tests/samples/industrial_plant.json"


def main():
    print("--- APEX GRAPH ENGINE DEMONSTRATION ---")

    # 1. Build a graph from mock industrial assets
    print("\n1. Building Graph...")
    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    build_res = requests.post(f"{BASE_URL}/build", json=data)
    print(f"Status: {build_res.status_code}, Response: {build_res.json()}")

    # 2. Query any node
    node_id = "V-102"
    print(f"\n2. Querying Node {node_id}...")
    node_res = requests.get(f"{BASE_URL}/node/{node_id}")
    print(json.dumps(node_res.json(), indent=2))

    # 3. Retrieve neighboring assets
    print(f"\n3. Retrieving neighbors for {node_id}...")
    neighbors_res = requests.get(f"{BASE_URL}/neighbors/{node_id}")
    print(json.dumps(neighbors_res.json(), indent=2))

    # 4 & 5. Compute the blast radius of a failed asset and display propagation path
    failed_asset = "P-101"
    print(f"\n4 & 5. Computing Blast Radius for {failed_asset}...")
    blast_res = requests.post(f"{BASE_URL}/blast-radius", json={"failed_asset": failed_asset})
    print(json.dumps(blast_res.json(), indent=2))

    # 6. Serialize and reload the graph
    print("\n6. Serializing graph...")
    dump_res = requests.get(f"{BASE_URL}/")
    graph_dump = dump_res.json()
    edges_list = graph_dump.get("links", graph_dump.get("edges", []))
    print(
        f"Graph serialized with {len(graph_dump.get('nodes', []))} nodes and {len(edges_list)} edges."
    )

    # 7. Show graph statistics
    print("\n7. Graph Statistics...")
    stats_res = requests.get(f"{BASE_URL}/statistics")
    print(json.dumps(stats_res.json(), indent=2))


if __name__ == "__main__":
    main()
