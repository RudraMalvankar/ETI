from typing import Dict, List, Tuple

import networkx as nx

from app.services.graph.GraphFactory import GraphFactory


class PropagationEngine:
    """
    Deterministic blast radius with scenario-specific constraints.
    """

    def __init__(self):
        self.graph = GraphFactory.get_graph().internal_graph

    def simulate_propagation(
        self, failed_asset: str, max_depth: int
    ) -> Tuple[List[str], List[Dict[str, str]]]:
        if not self.graph.has_node(failed_asset):
            return [], []

        affected_assets = set()
        propagation_path = []

        edges = nx.bfs_edges(self.graph, source=failed_asset, depth_limit=max_depth)

        for u, v in edges:
            affected_assets.add(v)
            edge_data = self.graph.get_edge_data(u, v)
            rel = edge_data.get("relationship", "AFFECTS") if edge_data else "AFFECTS"
            propagation_path.append({"from": u, "to": v, "relationship": rel})

        return list(affected_assets), propagation_path
