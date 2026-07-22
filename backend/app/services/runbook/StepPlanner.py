from typing import List

from app.schemas.runbook import RunbookStep


class StepPlanner:
    """
    Plans and prioritizes steps based on the decision output and graph dependencies.
    """

    def plan_steps(self, decision_payload: dict) -> List[RunbookStep]:
        # Generate some mock dynamic steps based on the recommended strategy
        strategy = decision_payload.get("recommended_strategy", "")
        assets = decision_payload.get("affected_assets", [])

        steps = []
        import uuid

        # Step 1: Initial Isolation
        steps.append(
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="Initial Isolation",
                description=f"Isolate primary affected assets: {', '.join(assets)}.",
                target_asset=assets[0] if assets else "Unknown",
                priority=1,
                estimated_duration=1.5,
            )
        )

        # Step 2: Implementation of strategy
        steps.append(
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="Execute Primary Strategy",
                description=f"Implement: {strategy}",
                target_asset=assets[0] if assets else "Unknown",
                priority=2,
                estimated_duration=2.0,
            )
        )

        # Step 3: Verification
        steps.append(
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="System Verification",
                description="Verify system stability and telemetry normalizations.",
                target_asset="System",
                priority=3,
                estimated_duration=1.0,
            )
        )

        return steps
