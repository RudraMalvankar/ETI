import networkx as nx

from app.schemas.graph import BlastRadiusResponse
from app.services.graph.GraphFactory import GraphFactory


class BlastRadiusEngine:
    def __init__(self):
        self.graph = GraphFactory.get_graph().internal_graph

    def compute_blast_radius(self, failed_node_id: str, max_depth: int = 5) -> BlastRadiusResponse:
        """
        Determines the deterministic failure propagation path.
        """
        if not self.graph.has_node(failed_node_id):
            raise ValueError(f"Node {failed_node_id} not found in graph.")

        # Traverse downstream to find affected components up to max_depth
        affected_nodes = set()
        propagation_path = []

        edges = nx.bfs_edges(self.graph, source=failed_node_id, depth_limit=max_depth)

        distance = 0
        for u, v in edges:
            affected_nodes.add(v)
            edge_data = self.graph.get_edge_data(u, v)
            rel = edge_data.get("relationship", "CONNECTED_TO") if edge_data else "CONNECTED_TO"
            propagation_path.append({"from": u, "to": v, "relationship": rel})
            distance += 1  # simplistic distance tracking for demo

        severity = (
            "CRITICAL"
            if len(affected_nodes) > 3
            else "HIGH" if len(affected_nodes) > 1 else "MEDIUM"
        )

        return BlastRadiusResponse(
            failed_asset=failed_node_id,
            affected_assets=list(affected_nodes),
            propagation_path=propagation_path,
            max_distance=max_depth,
            severity=severity,
        )
