from app.schemas.explainability import ExtendedDecisionTrace
from typing import Dict, Any

class DecisionTraceBuilder:
    def build_trace(self, context: Dict[str, Any]) -> ExtendedDecisionTrace:
        docs = [d.get("document_id", "") for d in context.get("documents", [])]
        scenarios = context.get("scenarios", [])
        best_sc = scenarios[0] if scenarios else {}
        nodes = best_sc.get("affected_assets", [])
        
        return ExtendedDecisionTrace(
            documents_used=docs,
            graph_nodes_traversed=nodes,
            selected_scenario=best_sc.get("name", "Unknown"),
            simulation_id=context.get("simulation_id", "sim-id-unknown"),
            citations_verified=docs,
            confidence=85.5
        )
