from app.schemas.explainability import ExplanationResponse
from app.services.explainability.EvidenceFormatter import EvidenceFormatter
from app.services.explainability.DecisionTraceBuilder import DecisionTraceBuilder
from app.services.explainability.ReasoningFormatter import ReasoningFormatter
from typing import Dict, Any

class ExplanationEngine:
    """
    Synthesizes deterministic evidence into a traceable, explainable AI response (<200ms latency).
    """
    def __init__(self):
        self.evidence_fmt = EvidenceFormatter()
        self.trace_builder = DecisionTraceBuilder()
        self.reason_fmt = ReasoningFormatter()

    def generate_explanation(self, context: Dict[str, Any]) -> ExplanationResponse:
        g_ev = self.evidence_fmt.format_graph_evidence(context)
        s_ev = self.evidence_fmt.format_simulation_evidence(context)
        d_ev = self.evidence_fmt.format_document_evidence(context)
        trace = self.trace_builder.build_trace(context)
        summary = self.reason_fmt.format_summary(trace, g_ev, s_ev, d_ev)
        
        return ExplanationResponse(
            decision_trace=trace,
            graph_evidence=g_ev,
            simulation_evidence=s_ev,
            document_evidence=d_ev,
            reasoning_summary=summary
        )
