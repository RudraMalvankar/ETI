import copy
from typing import Any, Dict

from app.services.graph.GraphFactory import GraphFactory


class StateManager:
    """
    Manages the deterministic system state during a simulation scenario.
    """

    def __init__(self):
        self.original_graph = GraphFactory.get_graph()
        self.scenario_state = {}

    def initialize_state(self):
        """Creates a snapshot of the current node states."""
        for node_id, data in self.original_graph.all_nodes():
            self.scenario_state[node_id] = copy.deepcopy(data)

    def update_node_state(self, node_id: str, new_status: str, risk_factor: float):
        if node_id in self.scenario_state:
            self.scenario_state[node_id]["status"] = new_status
            self.scenario_state[node_id]["simulated_risk"] = risk_factor

    def get_state_snapshot(self) -> Dict[str, Any]:
        return copy.deepcopy(self.scenario_state)
