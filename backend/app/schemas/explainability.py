from typing import Any

from pydantic import BaseModel, Field


class ExtendedDecisionTrace(BaseModel):
    documents_used: list[Any] = Field(default_factory=list)
    graph_nodes_traversed: list[Any] = Field(default_factory=list)
    selected_scenario: str = ""
    simulation_id: str = ""
    citations_verified: list[Any] = Field(default_factory=list)
    confidence: float = 0.0


class ExplanationResponse(BaseModel):
    decision_trace: ExtendedDecisionTrace
    graph_evidence: list[dict[str, Any]] = Field(default_factory=list)
    simulation_evidence: list[dict[str, Any]] = Field(default_factory=list)
    document_evidence: list[dict[str, Any]] = Field(default_factory=list)
    reasoning_summary: str = ""
