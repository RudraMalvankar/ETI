import uuid
from typing import List

from app.schemas.runbook import RunbookStep


class StepPlanner:
    """
    Plans runbook steps from the decision payload so each action is tied to
    the affected assets, reasoning, and recommended strategy.
    """

    @staticmethod
    def _normalize_assets(decision_payload: dict) -> List[str]:
        assets = decision_payload.get("affected_assets", []) or []
        if not assets:
            failed_asset = decision_payload.get("failed_asset")
            if failed_asset:
                assets = [failed_asset]
        return [asset for asset in assets if asset]

    def plan_steps(self, decision_payload: dict) -> List[RunbookStep]:
        strategy = decision_payload.get("recommended_strategy", "").strip()
        reasoning = decision_payload.get("reasoning", "").strip()
        alternatives = decision_payload.get("alternative_strategies", []) or []
        assets = self._normalize_assets(decision_payload)

        primary_asset = assets[0] if assets else "Unknown"
        asset_scope = ", ".join(assets) if assets else primary_asset

        investigation_text = (
            reasoning
            if reasoning
            else "Review current incident context, recent inspections, and upstream/downstream impact."
        )
        strategy_text = (
            strategy
            if strategy
            else "Apply the safest available containment and recovery procedure for the affected asset."
        )
        alternative_text = (
            alternatives[0]
            if alternatives
            else "Escalate to engineering for controlled shutdown if the primary strategy cannot be executed safely."
        )

        return [
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="Isolate Affected Equipment",
                description=(
                    f"Stabilize and isolate the impacted asset scope ({asset_scope}) before additional work begins. "
                    "Confirm the blast radius is bounded and notify adjacent operators."
                ),
                target_asset=primary_asset,
                priority=1,
                estimated_duration=1.0,
            ),
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="Review Evidence And Failure Context",
                description=(
                    "Validate the operational context against retrieved documents, recent incident signals, "
                    f"and decision reasoning: {investigation_text}"
                ),
                target_asset=primary_asset,
                priority=2,
                estimated_duration=1.0,
            ),
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="Execute Recommended Intervention",
                description=(
                    f"Apply the primary strategy for {asset_scope}: {strategy_text}"
                ),
                target_asset=primary_asset,
                priority=3,
                estimated_duration=2.0,
            ),
            RunbookStep(
                step_id=str(uuid.uuid4()),
                title="Verify Recovery And Contingency Readiness",
                description=(
                    "Confirm telemetry normalization, verify safe operating conditions, and prepare the fallback path if needed. "
                    f"Fallback strategy: {alternative_text}"
                ),
                target_asset=primary_asset,
                priority=4,
                estimated_duration=1.25,
            ),
        ]
