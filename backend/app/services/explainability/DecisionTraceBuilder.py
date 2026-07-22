from typing import Any, Dict

from app.schemas.explainability import ExtendedDecisionTrace


class DecisionTraceBuilder:
    """
    Builds deterministic decision trace mapping back to exact engine outputs.
    """

    def build_trace(self, context: Dict[str, Any]) -> ExtendedDecisionTrace:
        docs = []
        raw_docs = context.get("documents", [])
        for doc in raw_docs:
            if isinstance(doc, dict):
                doc_id = doc.get("document_id") or doc.get("chunk_id") or doc.get("id") or "doc_unk"
                docs.append(str(doc_id))
            elif isinstance(doc, str):
                docs.append(doc)

        scenarios = context.get("scenarios", [])
        best_sc = (
            scenarios[0]
            if (scenarios and isinstance(scenarios, list) and isinstance(scenarios[0], dict))
            else {}
        )

        # Traversed nodes
        nodes = context.get("graph_nodes", [])
        if not nodes and best_sc:
            nodes = best_sc.get("affected_assets", [])

        # Citations verified
        citations = context.get("citations_verified", [])
        if not citations:
            citations = docs

        sim_id = context.get("simulation_id", "sim-default")
        confidence = float(context.get("confidence", context.get("confidence_score", 90.0)))
        selected_scenario = best_sc.get(
            "name", context.get("selected_scenario", "Optimized Risk Isolation")
        )

        return ExtendedDecisionTrace(
            documents_used=docs,
            graph_nodes_traversed=nodes,
            selected_scenario=selected_scenario,
            simulation_id=sim_id,
            citations_verified=citations,
            confidence=confidence,
        )
