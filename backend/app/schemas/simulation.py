from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    failed_asset: str
    failure_type: str
    initial_telemetry: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    operating_mode: str = "normal"


class RiskProfile(BaseModel):
    safety_risk: float
    operational_risk: float
    financial_risk: float
    environmental_risk: float
    overall_score: float


class ScenarioResult(BaseModel):
    scenario_id: str
    name: str
    affected_assets: list[str]
    propagation_path: list[dict[str, str]]
    risk_score: RiskProfile
    estimated_downtime_hours: float
    estimated_cost_usd: float
    safety_level: str
    system_state_snapshot: dict[str, Any]


class SimulationResponse(BaseModel):
    simulation_id: str
    request: SimulationRequest
    scenarios: list[ScenarioResult]


class SimulationStatistics(BaseModel):
    total_simulations: int
    total_scenarios_generated: int
    average_downtime: float
