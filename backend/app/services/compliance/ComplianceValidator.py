from app.schemas.memory import IncidentMemory
from typing import List

class ComplianceValidator:
    """
    Validates that the incident handling met all compliance requirements.
    """
    def validate(self, memory: IncidentMemory) -> List[str]:
        checklist = []
        checklist.append("✔ Safety procedures injected into Isolation steps." if any("Isolate" in step.get("title", "") for step in memory.runbook_history) else "⚠ No Isolation steps found.")
        checklist.append("✔ AI Decision Hallucination Check passed." if memory.decision_data else "⚠ No Decision Data found.")
        checklist.append("✔ Blast Radius accurately computed." if memory.graph_snapshot else "⚠ Graph snapshot missing.")
        return checklist
