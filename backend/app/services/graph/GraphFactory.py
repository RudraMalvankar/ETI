from typing import Any, Dict

import networkx as nx


class APEXGraph:
    """
    Abstract wrapper around NetworkX to ensure Neo4j migration later.
    Separates graph logic from storage.
    """

    def __init__(self):
        self._graph = nx.DiGraph()

    @property
    def internal_graph(self) -> nx.DiGraph:
        return self._graph

    def clear(self):
        self._graph.clear()

    def get_node(self, node_id: str) -> Dict[str, Any]:
        return self._graph.nodes.get(node_id)

    def has_node(self, node_id: str) -> bool:
        return self._graph.has_node(node_id)

    def all_nodes(self):
        return self._graph.nodes(data=True)

    def all_edges(self):
        return self._graph.edges(data=True)


class GraphFactory:
    """
    Provides the global instance of the APEX Graph.
    """

    _instance: APEXGraph = None

    @classmethod
    def get_graph(cls) -> APEXGraph:
        if cls._instance is None:
            cls._instance = APEXGraph()
        return cls._instance

    @classmethod
    def reset(cls):
        if cls._instance is not None:
            cls._instance.clear()
