from app.schemas.memory import IncidentMemory
from typing import List, Dict, Any

class EvidenceCollector:
    """
    Collects and packages all deterministic evidence for audit.
    """
    def collect(self, memory: IncidentMemory) -> List[Dict[str, Any]]:
        evidence = []
        
        evidence.append({
            "source": "Graph Engine",
            "data": f"{memory.graph_snapshot.get('nodes_count')} connected assets evaluated."
        })
        
        if memory.simulation_data:
            scenarios = memory.simulation_data.get('scenarios', [])
            if scenarios:
                evidence.append({
                    "source": "Simulation Engine",
                    "data": f"Cost risk evaluated at ${scenarios[0].get('estimated_cost_usd')}"
                })
        
        return evidence
