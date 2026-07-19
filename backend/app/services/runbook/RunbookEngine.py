from typing import Dict
from app.schemas.runbook import Runbook, RunbookRequest, FeedbackRequest
from app.services.runbook.RunbookGenerator import RunbookGenerator
from app.services.runbook.FeedbackProcessor import FeedbackProcessor
from app.services.runbook.RegenerationEngine import RegenerationEngine
from app.services.runbook.RunbookValidator import RunbookValidator

class RunbookEngine:
    """
    Orchestrates the Dynamic Runbook Engine and holds state.
    """
    _db: Dict[str, Runbook] = {}
    _stats = {"total": 0, "active": 0, "completed": 0, "regenerations": 0}

    def __init__(self):
        self.generator = RunbookGenerator()
        self.feedback = FeedbackProcessor()
        self.regenerator = RegenerationEngine()
        self.validator = RunbookValidator()

    def generate(self, request: RunbookRequest) -> Runbook:
        rb = self.generator.generate(request)
        if self.validator.validate(rb):
            RunbookEngine._db[rb.runbook_id] = rb
            RunbookEngine._stats["total"] += 1
            RunbookEngine._stats["active"] += 1
            return rb
        raise ValueError("Generated runbook is invalid.")

    def get_runbook(self, rb_id: str) -> Runbook:
        return RunbookEngine._db.get(rb_id)

    def process_feedback(self, rb_id: str, step_id: str, request: FeedbackRequest) -> Runbook:
        rb = self.get_runbook(rb_id)
        if not rb:
            raise ValueError("Runbook not found.")
            
        failed = self.feedback.process(rb, step_id, request)
        if failed:
            return self.regenerate(rb_id)
            
        # Check completion
        if all(s.status == "completed" for s in rb.steps):
            rb.status = "completed"
            RunbookEngine._stats["active"] -= 1
            RunbookEngine._stats["completed"] += 1
            
        return rb

    def regenerate(self, rb_id: str) -> Runbook:
        rb = self.get_runbook(rb_id)
        if not rb:
            raise ValueError("Runbook not found.")
            
        rb = self.regenerator.regenerate(rb)
        RunbookEngine._stats["regenerations"] += 1
        return rb

    def get_statistics(self) -> dict:
        return {
            "total_runbooks": RunbookEngine._stats["total"],
            "active_runbooks": RunbookEngine._stats["active"],
            "completed_runbooks": RunbookEngine._stats["completed"],
            "total_regenerations": RunbookEngine._stats["regenerations"]
        }
