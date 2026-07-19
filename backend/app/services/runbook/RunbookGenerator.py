from app.schemas.runbook import Runbook, RunbookRequest
from app.services.runbook.StepPlanner import StepPlanner
from app.services.runbook.DependencyResolver import DependencyResolver
from app.services.runbook.SafetyValidator import SafetyValidator
from app.services.runbook.CitationMapper import CitationMapper
import uuid

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
        
        return Runbook(
            runbook_id=str(uuid.uuid4()),
            steps=steps,
            affected_assets=assets,
            total_estimated_duration=total_dur,
            update_history=["Runbook generated."]
        )
