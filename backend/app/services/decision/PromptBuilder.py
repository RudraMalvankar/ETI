import json
from typing import Any, Dict


class PromptBuilder:
    """
    Generates structured prompt for the LLM.
    """

    def build_prompt(self, context: Dict[str, Any]) -> str:
        prompt = (
            "You are an AI Decision Engine for an industrial plant.\n"
            "Analyze the following deterministic inputs and recommend the best mitigation strategy.\n"
            "Return ONLY valid JSON matching the specified output schema.\n\n"
            "### CONTEXT ###\n"
            f"{json.dumps(context, indent=2)}\n\n"
            "### INSTRUCTIONS ###\n"
            "1. Compare all generated scenarios.\n"
            "2. Evaluate operational trade-offs.\n"
            "3. Recommend the best mitigation strategy.\n"
            "4. Explain WHY that strategy is preferred.\n"
            "5. Cite the supporting document chunks used.\n"
            "6. Never invent assets, documents, or modify deterministic inputs.\n"
        )
        return prompt
