from typing import Any, Dict, List

from pydantic import BaseModel, Field


class ComplianceReportRequest(BaseModel):
    incident_id: str


class ComplianceReport(BaseModel):
    report_id: str
    incident_summary: str
    root_cause: str
    timeline: List[Dict[str, str]] = Field(default_factory=list)
    graph_snapshot: Dict[str, Any] = Field(default_factory=dict)
    simulation_results: Dict[str, Any] = Field(default_factory=dict)
    decision_trace: Dict[str, Any] = Field(default_factory=dict)
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    runbook_history: List[Dict[str, Any]] = Field(default_factory=list)
    technician_actions: List[Any] = Field(default_factory=list)
    compliance_checklist: List[str] = Field(default_factory=list)
    final_resolution: str = "Resolved"


class ExportRequest(BaseModel):
    report_id: str
