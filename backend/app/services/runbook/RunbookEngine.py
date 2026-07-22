from typing import Optional

from app.database.session import get_db_context
from app.models.simulation_runbook import RunbookModel
from app.schemas.runbook import FeedbackRequest, Runbook, RunbookRequest
from app.services.runbook.FeedbackProcessor import FeedbackProcessor
from app.services.runbook.RegenerationEngine import RegenerationEngine
from app.services.runbook.RunbookGenerator import RunbookGenerator
from app.services.runbook.RunbookValidator import RunbookValidator


class RunbookEngine:
    """
    Orchestrates the Dynamic Runbook Engine and holds state in DB.
    """

    _stats = {"total": 0, "active": 0, "completed": 0, "regenerations": 0}

    def __init__(self):
        self.generator = RunbookGenerator()
        self.feedback = FeedbackProcessor()
        self.regenerator = RegenerationEngine()
        self.validator = RunbookValidator()

    def generate(self, request: RunbookRequest) -> Runbook:
        rb = self.generator.generate(request)
        if self.validator.validate(rb):
            with get_db_context() as db:
                steps_dict = [s.model_dump() if hasattr(s, "model_dump") else s for s in rb.steps]
                db_rb = RunbookModel(
                    runbook_id=rb.runbook_id,
                    failed_asset=rb.failed_asset,
                    failure_type=rb.failure_type,
                    steps=steps_dict,
                    status=rb.status,
                    is_regenerated=rb.is_regenerated,
                    update_history=rb.update_history,
                )
                db.add(db_rb)

            RunbookEngine._stats["total"] += 1
            RunbookEngine._stats["active"] += 1
            return rb
        raise ValueError("Generated runbook is invalid.")

    def get_runbook(self, rb_id: str) -> Optional[Runbook]:
        with get_db_context() as db:
            row = db.query(RunbookModel).filter(RunbookModel.runbook_id == rb_id).first()
            if not row:
                return None
            from app.schemas.runbook import RunbookStep

            steps_list = [RunbookStep(**s) for s in row.steps] if row.steps else []
            total_dur = sum(s.estimated_duration for s in steps_list)
            return Runbook(
                runbook_id=row.runbook_id,
                failed_asset=row.failed_asset,
                failure_type=row.failure_type,
                steps=steps_list,
                affected_assets=[],
                total_estimated_duration=total_dur,
                status=row.status,
                is_regenerated=row.is_regenerated,
                update_history=row.update_history or [],
            )

    def process_feedback(self, rb_id: str, step_id: str, request: FeedbackRequest) -> Runbook:
        rb = self.get_runbook(rb_id)
        if not rb:
            raise ValueError("Runbook not found.")

        failed = self.feedback.process(rb, step_id, request)

        with get_db_context() as db:
            db_row = db.query(RunbookModel).filter(RunbookModel.runbook_id == rb_id).first()
            if db_row:
                steps_dict = [s.model_dump() if hasattr(s, "model_dump") else s for s in rb.steps]
                db_row.steps = steps_dict
                db_row.status = rb.status
                db_row.update_history = rb.update_history

        if failed:
            return self.regenerate(rb_id)

        # Check completion
        if all(s.status == "completed" for s in rb.steps):
            rb.status = "completed"

            with get_db_context() as db:
                db_row = db.query(RunbookModel).filter(RunbookModel.runbook_id == rb_id).first()
                if db_row:
                    db_row.status = "completed"

            RunbookEngine._stats["active"] -= 1
            RunbookEngine._stats["completed"] += 1

        return rb

    def regenerate(self, rb_id: str) -> Runbook:
        rb = self.get_runbook(rb_id)
        if not rb:
            raise ValueError("Runbook not found.")

        rb = self.regenerator.regenerate(rb)

        with get_db_context() as db:
            db_row = db.query(RunbookModel).filter(RunbookModel.runbook_id == rb_id).first()
            if db_row:
                steps_dict = [s.model_dump() if hasattr(s, "model_dump") else s for s in rb.steps]
                db_row.steps = steps_dict
                db_row.is_regenerated = rb.is_regenerated
                db_row.status = rb.status

        RunbookEngine._stats["regenerations"] += 1
        return rb

    def get_statistics(self) -> dict:
        return {
            "total_runbooks": RunbookEngine._stats["total"],
            "active_runbooks": RunbookEngine._stats["active"],
            "completed_runbooks": RunbookEngine._stats["completed"],
            "total_regenerations": RunbookEngine._stats["regenerations"],
        }
