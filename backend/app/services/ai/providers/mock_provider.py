import json
import numpy as np
from typing import List, Dict, Any
from .base import AIProvider

class MockAIProvider(AIProvider):
    """
    Mock AI Provider implementation for development, testing, and CI.
    Generates deterministic pseudo-random embeddings and mock JSON completions.
    """
    def __init__(self, dimension: int = 1536):
        self._dim = dimension

    def complete(self, prompt: str, system_prompt: str = "") -> str:
        # Determine prompt context to simulate realistic response
        prompt_lower = prompt.lower()
        
        # 1. Decision Recommendation Prompt
        if "decision" in prompt_lower or "strategy" in prompt_lower or "recommend" in prompt_lower:
            # Try to parse asset name from prompt, defaults to P-101
            failed_asset = "P-101"
            if "p-101" in prompt_lower:
                failed_asset = "P-101"
            elif "v-202" in prompt_lower:
                failed_asset = "V-202"

            mock_decision = {
                "recommended_strategy": f"Isolate asset {failed_asset} immediately and engage active bypass logic.",
                "alternative_strategies": [
                    "Proceed with scheduled shutdown window under thermal monitoring.",
                    "Shutdown entire upstream sub-station to prevent downstream propagation."
                ],
                "reasoning": f"Based on thermal telemetry and propagation logic, leaving {failed_asset} active carries a 94.5% risk of thermal breakdown in adjacent components. Isolation reduces propagation risk to zero.",
                "supporting_citations": [
                    {
                        "document_id": "doc-manual-01",
                        "chunk_id": "chunk-101",
                        "text_snippet": f"In case of abnormal temperature on {failed_asset}, immediately isolate inlet valve V-202."
                    }
                ],
                "confidence_score": 0.95,
                "affected_assets": [failed_asset, "V-202"],
                "estimated_risk_reduction": 89.2,
                "estimated_cost": 2500.0,
                "estimated_downtime": 1.5
            }
            return json.dumps(mock_decision)

        # 2. Runbook/Compliance/Default Prompt
        return json.dumps({
            "response": "Deterministic mock completion response for non-decision tasks."
        })

    def embed(self, text: str) -> List[float]:
        # Pseudo-random but deterministic based on hash
        seed = abs(hash(text)) % (2**32)
        np.random.seed(seed)
        vec = np.random.randn(self._dim)
        vec = vec / np.linalg.norm(vec)
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed(t) for t in texts]
