import json
from typing import Any, Dict

from app.services.ai.providers.factory import ProviderFactory


class ScenarioEvaluator:
    """
    Interfaces with the active AI Provider (Gemini, NIM, or Mock) to evaluate the decision prompt.
    Returns provider output and fails loudly when live generation is unavailable.
    """

    def evaluate(self, prompt: str, context: Dict[str, Any]) -> str:
        provider = ProviderFactory.get_provider()

        system_prompt = (
            "You are the APEX Decision Intelligence Engine, a premium industrial AI copilot. "
            "Analyze the failure context, RAG documentation, and simulation scenarios. "
            "Generate a highly specific operational recommendation. "
            "You MUST respond ONLY with a raw JSON object matching the following structure:\n"
            "{\n"
            '  "recommended_strategy": "string",\n'
            '  "alternative_strategies": ["string"],\n'
            '  "reasoning": "string",\n'
            '  "supporting_citations": [{"document_id": "string", "chunk_id": "string", "text_snippet": "string"}],\n'
            '  "confidence_score": 0.0,\n'
            '  "affected_assets": ["string"],\n'
            '  "estimated_risk_reduction": 0.0,\n'
            '  "estimated_cost": 0.0,\n'
            '  "estimated_downtime": 0.0\n'
            "}\n"
            "Do not include any formatting, markdown wrapping (like ```json), or trailing text."
        )

        try:
            raw_output = provider.complete(prompt, system_prompt=system_prompt)
            clean_output = raw_output.strip()

            # Clean up markdown wrapping if present
            if clean_output.startswith("```"):
                lines = clean_output.split("\n")
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    clean_output = "\n".join(lines[1:-1]).strip()

            # Test JSON validity
            json.loads(clean_output)
            return clean_output
        except Exception as exc:
            raise RuntimeError(
                f"Decision evaluation failed using provider '{provider.__class__.__name__}': {exc}"
            ) from exc
