from typing import Any, Dict


class ConfidenceEngine:
    """
    Computes a deterministic confidence score based on the quality of inputs
    and alignment of the LLM output with deterministic realities.
    """

    def compute_confidence(self, context: Dict[str, Any], valid_citations_count: int) -> float:
        score = 60.0  # Base confidence

        # Boost confidence based on available document citations
        if valid_citations_count > 0:
            score += 15.0 + (min(valid_citations_count, 3) * 5.0)

        # Penalize if graph is highly uncertain (many scenarios)
        scenarios = context.get("scenarios", [])
        if len(scenarios) > 3:
            score -= 10.0

        return min(100.0, max(0.0, score))
