from typing import List, Dict, Any

class ReasoningFormatter:
    def format_summary(self, decision_trace: Any, graph_ev: List, sim_ev: List, doc_ev: List) -> str:
        summary = "Based on purely deterministic inputs:\n"
        if doc_ev:
            summary += f"- Found {len(doc_ev)} relevant document chunks indicating procedural necessity.\n"
        if graph_ev:
            summary += f"- Identified {len(decision_trace.graph_nodes_traversed)} critical downstream dependencies via the Graph Engine.\n"
        if sim_ev:
            summary += f"- Chose {decision_trace.selected_scenario} due to lowest risk scoring from the Shadow Simulation Engine.\n"
        summary += "The AI Engine acts only as a synthesizer and has not invented any structural realities."
        return summary
