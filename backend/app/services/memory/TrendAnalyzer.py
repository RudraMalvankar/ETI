from typing import Any, Dict

from app.services.memory.IncidentHistoryStore import global_incident_store


class TrendAnalyzer:
    """
    Analyzes stored incidents to generate organizational trends and failure statistics.
    """

    def analyze_trends(self) -> Dict[str, Any]:
        incidents = global_incident_store.get_all()

        total = len(incidents)
        if total == 0:
            return {
                "total_incidents": 0,
                "most_common_failure_type": "N/A",
                "most_vulnerable_asset": "N/A",
                "failure_distribution": {},
                "asset_vulnerability_ranking": {},
                "resolution_rate": 100.0,
                "message": "No historical data to analyze trends.",
            }

        failure_types: Dict[str, int] = {}
        affected_assets: Dict[str, int] = {}
        outcomes: Dict[str, int] = {}

        for inc in incidents:
            failure_types[inc.failure_type] = failure_types.get(inc.failure_type, 0) + 1
            affected_assets[inc.failed_asset] = affected_assets.get(inc.failed_asset, 0) + 1
            outcomes[inc.outcome] = outcomes.get(inc.outcome, 0) + 1

        resolved_count = outcomes.get("Resolved", 0)
        resolution_rate = round((resolved_count / total) * 100.0, 2)

        return {
            "total_incidents": total,
            "most_common_failure_type": max(failure_types, key=failure_types.get),
            "most_vulnerable_asset": max(affected_assets, key=affected_assets.get),
            "failure_distribution": failure_types,
            "asset_vulnerability_ranking": affected_assets,
            "resolution_rate": resolution_rate,
        }
