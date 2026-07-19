from app.services.graph.GraphFactory import GraphFactory
import networkx as nx

class PathFinder:
    def __init__(self):
        self.graph = GraphFactory.get_graph().internal_graph

    def shortest_path(self, source: str, target: str):
        try:
            return nx.shortest_path(self.graph, source=source, target=target, weight='weight')
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def critical_path(self):
        """
        Finds the longest path in a DAG. Used for critical dependency paths.
        """
        if nx.is_directed_acyclic_graph(self.graph):
            return nx.dag_longest_path(self.graph, weight='weight')
        return []
