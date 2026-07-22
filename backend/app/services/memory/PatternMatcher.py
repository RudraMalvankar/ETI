from typing import Any, Dict, List

from app.services.memory.IncidentHistoryStore import global_incident_store


class PatternMatcher:
    """
    Finds historical incidents similar to the search query with high performance (<100ms).
    """

    def search_similar(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        results = []
        if not query:
            incidents = global_incident_store.get_all()
            return [inc.model_dump() for inc in incidents[:top_k]]

        query_terms = [t.lower() for t in query.split()]

        for inc in global_incident_store.get_all():
            score = 0.0
            asset_lower = inc.failed_asset.lower()
            type_lower = inc.failure_type.lower()
            outcome_lower = inc.outcome.lower()

            for term in query_terms:
                if term in asset_lower:
                    score += 3.0
                if term in type_lower:
                    score += 2.0
                if term in outcome_lower:
                    score += 1.0

            if score > 0:
                results.append({"incident": inc, "score": score})

        results.sort(key=lambda x: float(x["score"]), reverse=True)
        return [r["incident"].model_dump() for r in results[:top_k]]
