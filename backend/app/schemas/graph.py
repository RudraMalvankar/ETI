from typing import Any

from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    node_id: str
    asset_id: str
    asset_type: str
    status: str = "operational"
    criticality: str = "medium"
    location: str | None = None
    telemetry_snapshot: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    edge_id: str
    source: str
    target: str
    relationship: str
    weight: float = 1.0
    direction: str = "directed"
    risk_factor: float = 1.0


class BlastRadiusResponse(BaseModel):
    failed_asset: str
    affected_assets: list[str]
    propagation_path: list[dict[str, str]]
    max_distance: int
    severity: str


class GraphStatistics(BaseModel):
    total_nodes: int
    total_edges: int
    connected_components: int
    is_directed_acyclic_graph: bool
    density: float
