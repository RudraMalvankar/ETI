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
            evidence_summary = ""
            if failed_step.document_citations:
                cited_docs = sorted(
                    {citation.get("document_id", "") for citation in failed_step.document_citations}
                )
                evidence_summary = (
                    f" Re-check cited procedures and evidence from: {', '.join(doc for doc in cited_docs if doc)}."
                )

            new_steps.append(
                RunbookStep(
                    step_id=str(uuid.uuid4()),
                    title=f"Mitigate Failed Step: {failed_step.title}",
                    description=(
                        f"Investigate why '{failed_step.title}' failed on asset {failed_step.target_asset}. "
                        "Stabilize the work area, capture technician findings, and execute the safest alternate intervention."
                        f"{evidence_summary}"
                    ),
                    target_asset=failed_step.target_asset,
                    priority=failed_step.priority,
                    estimated_duration=failed_step.estimated_duration * 1.5,
                    document_citations=failed_step.document_citations,
                )
            )

            new_steps.append(
                RunbookStep(
                    step_id=str(uuid.uuid4()),
                    title="Verify Recovery After Regeneration",
                    description=(
                        "Confirm the mitigated asset is stable, validate upstream/downstream dependencies, "
                        "and record the updated operational state before closure."
                    ),
                    target_asset=failed_step.target_asset,
                    priority=failed_step.priority + 1,
                    estimated_duration=1.0,
                    document_citations=failed_step.document_citations,
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
