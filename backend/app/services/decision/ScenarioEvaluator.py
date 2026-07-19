from typing import Dict, Any
import json

class ScenarioEvaluator:
    """
    Interfaces with the LLM to evaluate the prompt and return the decision.
    Since we do not have an actual LLM API key, this serves as a deterministic 
    Mock LLM that acts exactly as described by parsing the deterministic inputs.
    """
    def evaluate(self, prompt: str, context: Dict[str, Any]) -> str:
        # Mock LLM reasoning based on context
        failed_asset = context.get('failed_asset', 'Unknown')
        scenarios = context.get('scenarios', [])
        docs = context.get('documents', [])
        
        best_scenario = None
        for s in scenarios:
            if s['name'] == 'Best Case':
                best_scenario = s
                break
        if not best_scenario and scenarios:
            best_scenario = scenarios[0]
            
        affected_assets = best_scenario.get('affected_assets', []) if best_scenario else []
        cost = best_scenario.get('estimated_cost_usd', 0.0) if best_scenario else 0.0
        downtime = best_scenario.get('estimated_downtime_hours', 0.0) if best_scenario else 0.0
        
        citations = []
        if docs:
            citations.append({
                "document_id": docs[0]["document_id"],
                "chunk_id": docs[0]["chunk_id"],
                "text_snippet": docs[0]["text"][:50]
            })

        response_dict = {
            "recommended_strategy": f"Immediately isolate {failed_asset} and apply manual override to upstream components.",
            "alternative_strategies": [
                "Proceed with planned maintenance window, risking propagation.",
                "Shutdown entire affected subsystem."
            ],
            "reasoning": f"Based on the Knowledge Graph simulation, leaving {failed_asset} unmitigated will lead to cascading failure. Isolating it restricts the blast radius to the Best Case scenario.",
            "supporting_citations": citations,
            "confidence_score": 0.0, # Will be overridden by ConfidenceEngine
            "affected_assets": affected_assets,
            "estimated_risk_reduction": 80.5,
            "estimated_cost": cost,
            "estimated_downtime": downtime
        }
        
        return json.dumps(response_dict)
