from typing import Dict, Any
from app.services.memory.IncidentHistoryStore import global_incident_store

class TrendAnalyzer:
    """
    Analyzes stored incidents to generate organizational trends.
    """
    def analyze_trends(self) -> Dict[str, Any]:
        incidents = global_incident_store.get_all()
        
        total = len(incidents)
        if total == 0:
            return {"message": "No historical data to analyze trends."}
            
        failure_types = {}
        affected_assets = {}
        
        for inc in incidents:
            failure_types[inc.failure_type] = failure_types.get(inc.failure_type, 0) + 1
            affected_assets[inc.failed_asset] = affected_assets.get(inc.failed_asset, 0) + 1
            
        return {
            "total_incidents": total,
            "most_common_failure_type": max(failure_types, key=failure_types.get),
            "most_vulnerable_asset": max(affected_assets, key=affected_assets.get),
            "failure_distribution": failure_types
        }
