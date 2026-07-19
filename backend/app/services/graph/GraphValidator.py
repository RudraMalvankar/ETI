from app.services.graph.GraphFactory import GraphFactory
import networkx as nx

class GraphValidator:
    def __init__(self):
        self.graph = GraphFactory.get_graph().internal_graph

    def validate(self) -> dict:
        """
        Validates graph integrity.
        """
        issues = []
        
        # Check disconnected components (assuming undirected representation for connectedness)
        undirected = self.graph.to_undirected()
        components = list(nx.connected_components(undirected))
        if len(components) > 1:
            issues.append(f"Graph is disconnected into {len(components)} components.")
            
        # Check cycles if it's supposed to be a DAG
        try:
            cycles = list(nx.simple_cycles(self.graph))
            if cycles:
                issues.append(f"Circular dependencies found: {len(cycles)} cycles.")
        except Exception:
            pass
            
        # Validate node attributes
        for node, data in self.graph.nodes(data=True):
            if 'asset_type' not in data:
                issues.append(f"Node {node} missing asset_type")

        return {
            "is_valid": len(issues) == 0,
            "issues": issues
        }
