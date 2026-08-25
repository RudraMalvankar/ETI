import datetime
from typing import Any

from pydantic import BaseModel, Field


class IncidentMemory(BaseModel):
    incident_id: str
    failed_asset: str
    failure_type: str
    graph_snapshot: dict[str, Any] = Field(default_factory=dict)
    simulation_data: dict[str, Any] = Field(default_factory=dict)
    decision_data: dict[str, Any] = Field(default_factory=dict)
    runbook_history: list[dict[str, Any]] = Field(default_factory=list)
    technician_feedback: list[Any] = Field(default_factory=list)
    regenerated_runbooks: list[dict[str, Any]] = Field(default_factory=list)
    outcome: str = "Resolved"
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now(datetime.UTC).isoformat())


class StoreMemoryRequest(BaseModel):
    failed_asset: str
    failure_type: str
    simulation_id: str | None = ""
    runbook_id: str | None = ""
    decision_data: dict[str, Any] | None = None
    outcome: str | None = "Resolved"
    technician_feedback: list[Any] | None = None


class SearchMemoryRequest(BaseModel):
    query: str
    top_k: int = 5
