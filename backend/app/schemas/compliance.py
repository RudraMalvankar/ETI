from typing import Any

from pydantic import BaseModel, Field


class ComplianceReportRequest(BaseModel):
    incident_id: str


class ComplianceReport(BaseModel):
    report_id: str
    incident_summary: str
    root_cause: str
    timeline: list[dict[str, str]] = Field(default_factory=list)
    graph_snapshot: dict[str, Any] = Field(default_factory=dict)
    simulation_results: dict[str, Any] = Field(default_factory=dict)
    decision_trace: dict[str, Any] = Field(default_factory=dict)
    supporting_evidence: list[dict[str, Any]] = Field(default_factory=list)
    runbook_history: list[dict[str, Any]] = Field(default_factory=list)
    technician_actions: list[Any] = Field(default_factory=list)
    compliance_checklist: list[str] = Field(default_factory=list)
    final_resolution: str = "Resolved"


class ExportRequest(BaseModel):
    report_id: str
