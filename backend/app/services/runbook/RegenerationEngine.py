import uuid

from app.schemas.runbook import Runbook, RunbookStep
from app.services.runbook.DependencyResolver import DependencyResolver
from app.services.runbook.SafetyValidator import SafetyValidator


class RegenerationEngine:
    """
    Regenerates remaining steps when a failure occurs.
    """

    def __init__(self):
        self.resolver = DependencyResolver()
        self.safety = SafetyValidator()

    def regenerate(self, runbook: Runbook) -> Runbook:
        # Preserve completed steps
        completed_steps = [s for s in runbook.steps if s.status == "completed"]
        failed_step = next((s for s in runbook.steps if s.status == "failed"), None)

        # Recalculate remaining workflow
        new_steps = []
        if failed_step:
            new_steps.append(
                RunbookStep(
                    step_id=str(uuid.uuid4()),
                    title=f"Mitigate Failure: {failed_step.title}",
                    description="Investigate and mitigate the failed step. Apply alternative strategy.",
                    target_asset=failed_step.target_asset,
                    priority=failed_step.priority,
                    estimated_duration=failed_step.estimated_duration * 1.5,
                    document_citations=failed_step.document_citations,
                )
            )

            new_steps.append(
                RunbookStep(
                    step_id=str(uuid.uuid4()),
                    title="System Verification Post-Mitigation",
                    description="Verify system stability.",
                    target_asset="System",
                    priority=failed_step.priority + 1,
                    estimated_duration=1.0,
                )
            )

        new_steps = self.resolver.resolve_dependencies(new_steps)
        new_steps = self.safety.apply_safety_rules(new_steps)

        # We need to wire dependencies between completed and new steps properly
        if completed_steps and new_steps:
            new_steps[0].prerequisites = [completed_steps[-1].step_id]

        runbook.steps = completed_steps + new_steps
        runbook.total_estimated_duration = sum(s.estimated_duration for s in runbook.steps)
        runbook.update_history.append("Runbook regenerated due to step failure.")

        return runbook
