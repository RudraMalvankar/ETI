import uuid

from app.schemas.runbook import Runbook, RunbookRequest
from app.services.runbook.CitationMapper import CitationMapper
from app.services.runbook.DependencyResolver import DependencyResolver
from app.services.runbook.SafetyValidator import SafetyValidator
from app.services.runbook.StepPlanner import StepPlanner


class RunbookGenerator:
    """
    Generates the adaptive runbook workflow.
    """

    def __init__(self):
        self.planner = StepPlanner()
        self.resolver = DependencyResolver()
        self.safety = SafetyValidator()
        self.mapper = CitationMapper()

    def generate(self, request: RunbookRequest) -> Runbook:
        payload = request.decision_payload
        payload.setdefault("simulation_id", request.simulation_id)

        # 1. Plan Steps
        steps = self.planner.plan_steps(payload)

        # 2. Resolve Dependencies
        steps = self.resolver.resolve_dependencies(steps)

        # 3. Apply Safety
        steps = self.safety.apply_safety_rules(steps)

        # 4. Map citations
        citations = payload.get("supporting_citations", [])
        steps = self.mapper.map_citations(steps, citations)

        total_dur = sum(s.estimated_duration for s in steps)
        assets = payload.get("affected_assets", [])
        failed_asset = payload.get("failed_asset") or (assets[0] if assets else "Unknown")
        failure_type = payload.get("failure_type", "Operational Incident")

        return Runbook(
            runbook_id=str(uuid.uuid4()),
            failed_asset=failed_asset,
            failure_type=failure_type,
            steps=steps,
            affected_assets=assets,
            total_estimated_duration=total_dur,
            update_history=[
                f"Runbook generated from simulation {request.simulation_id}.",
                f"Primary asset scope: {', '.join(assets) if assets else failed_asset}.",
            ],
        )
