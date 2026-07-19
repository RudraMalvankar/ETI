from app.schemas.graph import GraphNode, GraphEdge
from app.services.graph.GraphFactory import GraphFactory
from typing import List

class GraphBuilder:
    def __init__(self):
        self.apex_graph = GraphFactory.get_graph()
        self.graph = self.apex_graph.internal_graph

    def build_from_lists(self, nodes: List[GraphNode], edges: List[GraphEdge]):
        """
        Populate the Deterministic Knowledge Graph Engine.
        """
        for node in nodes:
            self.graph.add_node(
                node.node_id,
                asset_id=node.asset_id,
                asset_type=node.asset_type,
                status=node.status,
                criticality=node.criticality,
                location=node.location,
                telemetry_snapshot=node.telemetry_snapshot,
                metadata=node.metadata
            )
            
        for edge in edges:
            self.graph.add_edge(
                edge.source,
                edge.target,
                edge_id=edge.edge_id,
                relationship=edge.relationship,
                weight=edge.weight,
                risk_factor=edge.risk_factor
            )
