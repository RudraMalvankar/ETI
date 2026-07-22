from typing import List

from app.schemas.runbook import RunbookStep


class SafetyValidator:
    """
    Injects required safety checks into steps.
    """

    def apply_safety_rules(self, steps: List[RunbookStep]) -> List[RunbookStep]:
        for step in steps:
            if "Isolate" in step.title:
                step.safety_requirements = ["Lockout/Tagout (LOTO)", "Verify Zero Energy"]
                step.required_tools = ["Voltage Detector", "LOTO Kit"]
            else:
                step.safety_requirements = ["Standard PPE"]
                step.required_tools = ["Standard Toolkit"]
        return steps
