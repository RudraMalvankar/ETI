from typing import Any, Dict, List

from app.schemas.memory import IncidentMemory


class EvidenceCollector:
    """
    Collects and packages all deterministic evidence for enterprise audit compliance.
    """

    def collect(self, memory: IncidentMemory) -> List[Dict[str, Any]]:
        evidence = []

        # 1. Graph Evidence
        if memory.graph_snapshot:
            nodes_count = memory.graph_snapshot.get("nodes_count", 0)
            edges_count = memory.graph_snapshot.get("edges_count", 0)
            failed_node = memory.graph_snapshot.get("failed_node", {})
            evidence.append(
                {
                    "source": "Knowledge Graph Engine",
                    "category": "Topology & Blast Radius",
                    "details": f"Evaluated graph topology with {nodes_count} nodes and {edges_count} edges. Target asset node: {failed_node.get('id', memory.failed_asset)}.",
                }
            )

        # 2. Simulation Evidence
        if memory.simulation_data:
            scenarios = memory.simulation_data.get("scenarios", [])
            sim_id = memory.simulation_data.get("simulation_id", "sim-stored")
            evidence.append(
                {
                    "source": "Shadow Simulation Engine",
                    "category": "Risk & Downtime Modeling",
                    "details": f"Simulation ID {sim_id} generated {len(scenarios)} distinct failure scenarios.",
                }
            )

        # 3. Decision Evidence
        if memory.decision_data:
            confidence = memory.decision_data.get("confidence_score") or memory.decision_data.get(
                "confidence", 90.0
            )
            rec = memory.decision_data.get("recommended_strategy", "Optimized Strategy")
            evidence.append(
                {
                    "source": "AI Decision Engine",
                    "category": "Deterministic Decision Trace",
                    "details": f"Strategy '{rec}' validated with confidence score {confidence}%.",
                }
            )

        # 4. Runbook & Technician Evidence
        if memory.runbook_history:
            evidence.append(
                {
                    "source": "Dynamic Runbook Engine",
                    "category": "Execution Procedure",
                    "details": f"Logged {len(memory.runbook_history)} operational execution steps.",
                }
            )

        return evidence
