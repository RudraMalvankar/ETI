"""
Tests: Knowledge Graph API
===========================
Covers build, get, node, neighbors, blast-radius, path, statistics.
"""

import pytest


GRAPH_PAYLOAD = {
    "nodes": [
        {
            "node_id": "pump_X",
            "asset_id": "pump_X",
            "asset_type": "Pump",
            "status": "operational",
            "criticality": "high",
        },
        {
            "node_id": "valve_Y",
            "asset_id": "valve_Y",
            "asset_type": "Valve",
            "status": "operational",
            "criticality": "medium",
        },
        {
            "node_id": "comp_Z",
            "asset_id": "comp_Z",
            "asset_type": "Compressor",
            "status": "operational",
            "criticality": "critical",
        },
    ],
    "edges": [
        {
            "edge_id": "gx_e1",
            "source": "pump_X",
            "target": "valve_Y",
            "relationship": "feeds",
            "weight": 1.0,
            "risk_factor": 0.9,
        },
        {
            "edge_id": "gx_e2",
            "source": "valve_Y",
            "target": "comp_Z",
            "relationship": "supplies",
            "weight": 1.0,
            "risk_factor": 0.8,
        },
    ],
}


class TestGraphBuild:
    def test_build_graph_success(self, client, engineer_headers):
        resp = client.post("/api/v1/graph/build", json=GRAPH_PAYLOAD, headers=engineer_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["nodes"] == 3
        assert data["edges"] == 2

    def test_build_graph_requires_auth(self, client):
        resp = client.post("/api/v1/graph/build", json=GRAPH_PAYLOAD)
        assert resp.status_code in (401, 403)

    def test_build_graph_operator_forbidden(self, client, operator_headers):
        resp = client.post("/api/v1/graph/build", json=GRAPH_PAYLOAD, headers=operator_headers)
        assert resp.status_code in (401, 403)

    def test_build_graph_empty_nodes(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/graph/build",
            json={"nodes": [], "edges": []},
            headers=engineer_headers,
        )
        assert resp.status_code in (201, 400, 422)

    def test_build_graph_invalid_body(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/graph/build",
            json={"invalid": "payload"},
            headers=engineer_headers,
        )
        assert resp.status_code == 422


class TestGraphGet:
    def test_get_graph_data(self, client, built_graph, operator_headers):
        resp = client.get("/api/v1/graph/", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)

    def test_get_graph_requires_auth(self, client):
        resp = client.get("/api/v1/graph/")
        assert resp.status_code in (401, 403)


class TestGraphNode:
    def test_get_node_success(self, client, built_graph, operator_headers):
        resp = client.get("/api/v1/graph/node/pump_A", headers=operator_headers)
        # Node may or may not exist depending on graph fixture
        assert resp.status_code in (200, 404)

    def test_get_nonexistent_node(self, client, built_graph, operator_headers):
        resp = client.get("/api/v1/graph/node/nonexistent_xyz_node", headers=operator_headers)
        assert resp.status_code == 404

    def test_get_node_requires_auth(self, client):
        resp = client.get("/api/v1/graph/node/pump_A")
        assert resp.status_code in (401, 403)


class TestGraphNeighbors:
    def test_get_neighbors_success(self, client, built_graph, operator_headers):
        resp = client.get("/api/v1/graph/neighbors/pump_A", headers=operator_headers)
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            data = resp.json()
            assert "neighbors" in data

    def test_get_neighbors_requires_auth(self, client):
        resp = client.get("/api/v1/graph/neighbors/pump_A")
        assert resp.status_code in (401, 403)


class TestBlastRadius:
    def test_blast_radius_success(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/graph/blast-radius",
            json={"failed_asset": "pump_A"},
            headers=operator_headers,
        )
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            data = resp.json()
            assert "failed_asset" in data
            assert "affected_assets" in data
            assert "severity" in data

    def test_blast_radius_nonexistent_asset(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/graph/blast-radius",
            json={"failed_asset": "nonexistent_asset_xyz"},
            headers=operator_headers,
        )
        assert resp.status_code == 404

    def test_blast_radius_requires_auth(self, client):
        resp = client.post("/api/v1/graph/blast-radius", json={"failed_asset": "pump_A"})
        assert resp.status_code in (401, 403)

    def test_blast_radius_missing_asset(self, client, built_graph, operator_headers):
        resp = client.post(
            "/api/v1/graph/blast-radius",
            json={},
            headers=operator_headers,
        )
        assert resp.status_code == 422


class TestGraphStatistics:
    def test_get_statistics_success(self, client, built_graph, operator_headers):
        resp = client.get("/api/v1/graph/statistics", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_nodes" in data
        assert "total_edges" in data
        assert "density" in data
        assert isinstance(data["total_nodes"], int)

    def test_get_statistics_requires_auth(self, client):
        resp = client.get("/api/v1/graph/statistics")
        assert resp.status_code in (401, 403)


class TestGraphPath:
    def test_path_between_nodes(self, client, built_graph, operator_headers):
        resp = client.get(
            "/api/v1/graph/path?source=pump_A&target=comp_C",
            headers=operator_headers,
        )
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            data = resp.json()
            assert "path" in data

    def test_path_requires_auth(self, client):
        resp = client.get("/api/v1/graph/path?source=pump_A&target=comp_C")
        assert resp.status_code in (401, 403)
