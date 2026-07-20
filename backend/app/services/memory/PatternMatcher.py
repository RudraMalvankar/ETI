from typing import List, Dict, Any
from app.schemas.memory import IncidentMemory
from app.services.memory.IncidentHistoryStore import global_incident_store

class PatternMatcher:
    """
    Finds historical incidents similar to the current one.
    """
    def search_similar(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        results = []
        # Simple keyword matching simulation
        query_terms = query.lower().split()
        
        for inc in global_incident_store.get_all():
            score = 0
            if any(term in inc.failed_asset.lower() for term in query_terms):
                score += 1
            if any(term in inc.failure_type.lower() for term in query_terms):
                score += 1
                
            if score > 0:
                results.append({"incident": inc, "score": score})
                
        results.sort(key=lambda x: x["score"], reverse=True)
        return [r["incident"].model_dump() for r in results[:top_k]]
