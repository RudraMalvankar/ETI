import json
from app.services.graph.GraphFactory import GraphFactory
import networkx as nx
from networkx.readwrite import json_graph

class GraphSerializer:
    def __init__(self):
        self.apex_graph = GraphFactory.get_graph()

    def serialize(self) -> dict:
        return json_graph.node_link_data(self.apex_graph.internal_graph)

    def save_to_file(self, filepath: str):
        data = self.serialize()
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def load_from_file(self, filepath: str):
        with open(filepath, 'r') as f:
            data = json.load(f)
        self.apex_graph.clear()
        new_graph = json_graph.node_link_graph(data)
        self.apex_graph.internal_graph.update(new_graph)
