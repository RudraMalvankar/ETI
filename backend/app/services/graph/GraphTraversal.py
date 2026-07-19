from app.services.graph.GraphFactory import GraphFactory
import networkx as nx

class GraphTraversal:
    def __init__(self):
        self.graph = GraphFactory.get_graph().internal_graph

    def get_neighbors(self, node_id: str):
        if not self.graph.has_node(node_id):
            return []
        return list(self.graph.neighbors(node_id))

    def get_upstream(self, node_id: str):
        """Find nodes that flow into this node (predecessors)."""
        if not self.graph.has_node(node_id):
            return []
        return list(self.graph.predecessors(node_id))

    def get_downstream(self, node_id: str):
        """Find nodes that this node flows into (successors)."""
        if not self.graph.has_node(node_id):
            return []
        return list(self.graph.successors(node_id))

    def get_descendants(self, node_id: str):
        """All downstream nodes via BFS."""
        if not self.graph.has_node(node_id):
            return []
        return list(nx.descendants(self.graph, node_id))
