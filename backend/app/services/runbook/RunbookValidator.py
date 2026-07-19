from app.schemas.runbook import Runbook

class RunbookValidator:
    """
    Validates structural integrity of a Runbook before returning.
    """
    def validate(self, runbook: Runbook) -> bool:
        if not runbook.steps:
            return False
        return True
