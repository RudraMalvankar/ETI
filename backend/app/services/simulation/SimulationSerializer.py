from typing import Dict, Any

class SimulationSerializer:
    """
    Persists simulation results deterministically.
    """
    def __init__(self):
        self.db: Dict[str, Any] = {}

    def save(self, simulation_id: str, data: Any):
        self.db[simulation_id] = data

    def get(self, simulation_id: str) -> Any:
        return self.db.get(simulation_id)
        
    def get_all(self):
        return list(self.db.values())

# Global persistence for tests
global_simulation_db = SimulationSerializer()
