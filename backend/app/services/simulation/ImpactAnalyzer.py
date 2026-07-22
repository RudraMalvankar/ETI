from typing import Dict, List


class ImpactAnalyzer:
    """
    Computes deterministic downtime and cost based on graph data and scenario modifiers.
    """

    def compute_impact(
        self, affected_assets: List[Dict[str, str]], scenario_type: str
    ) -> Dict[str, float]:
        downtime = 0.0
        cost = 0.0

        for asset in affected_assets:
            criticality = asset.get("criticality", "medium")
            if criticality == "critical":
                downtime += 24.0
                cost += 50000.0
            elif criticality == "high":
                downtime += 12.0
                cost += 20000.0
            elif criticality == "medium":
                downtime += 4.0
                cost += 5000.0
            else:
                downtime += 1.0
                cost += 1000.0

        mod = (
            0.5
            if scenario_type == "Best Case"
            else 1.0 if scenario_type == "Expected Case" else 2.0
        )

        return {"downtime_hours": round(downtime * mod, 2), "cost_usd": round(cost * mod, 2)}
