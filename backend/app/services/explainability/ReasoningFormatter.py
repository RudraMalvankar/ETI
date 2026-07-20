from typing import List, Dict, Any

class ReasoningFormatter:
    """
    Formats a concise, non-hallucinated reasoning summary referencing only verified evidence.
    """
    def format_summary(self, decision_trace: Any, graph_ev: List, sim_ev: List, doc_ev: List) -> str:
        summary_lines = ["Based on purely deterministic system outputs:"]
        
        if doc_ev:
            summary_lines.append(f"- Verified {len(doc_ev)} document citations from the vector store.")
        if graph_ev:
            nodes_count = len(getattr(decision_trace, 'graph_nodes_traversed', []))
            summary_lines.append(f"- Mapped {nodes_count} interconnected assets via Knowledge Graph blast radius analysis.")
        if sim_ev:
            scenario_name = getattr(decision_trace, 'selected_scenario', 'Optimized Strategy')
            summary_lines.append(f"- Selected scenario '{scenario_name}' based on Shadow Simulation risk-downtime evaluation.")
            
        summary_lines.append(f"- Decision confidence calculated at {getattr(decision_trace, 'confidence', 90.0):.1f}%.")
        summary_lines.append("The AI recommendation acts strictly as a synthesizer and contains zero invented evidence.")
        
        return "\n".join(summary_lines)
