import json
from typing import Any

from pydantic import ValidationError

from app.schemas.decision import DecisionResponse


class JSONValidator:
    """
    Validates LLM output against the expected Pydantic JSON schema.
    """

    def validate_and_parse(self, raw_llm_output: str) -> dict[str, Any]:
        try:
            # Simple extraction in case LLM wrapped in markdown blocks
            if "```json" in raw_llm_output:
                raw_llm_output = raw_llm_output.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_llm_output:
                raw_llm_output = raw_llm_output.split("```")[1].split("```")[0].strip()

            data = json.loads(raw_llm_output)
            # Will raise ValidationError if structure is bad
            _ = DecisionResponse(**data)
            return data
        except json.JSONDecodeError as e:
            raise ValueError(f"LLM did not return valid JSON: {e!s}")
        except ValidationError as e:
            raise ValueError(f"LLM JSON output does not match schema: {e!s}")
