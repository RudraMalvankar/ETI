from app.schemas.runbook import Runbook, FeedbackRequest

class FeedbackProcessor:
    """
    Processes technician feedback for a specific step.
    """
    def process(self, runbook: Runbook, step_id: str, feedback: FeedbackRequest) -> bool:
        failed_step = False
        for step in runbook.steps:
            if step.step_id == step_id:
                step.status = feedback.status
                if feedback.status == "failed":
                    failed_step = True
                    runbook.update_history.append(f"Step {step_id} FAILED: {feedback.feedback_notes}")
                else:
                    runbook.update_history.append(f"Step {step_id} completed.")
                break
        return failed_step
