from typing import List

from app.schemas.runbook import RunbookStep


class DependencyResolver:
    """
    Resolves prerequisites and dependencies between steps.
    """

    def resolve_dependencies(self, steps: List[RunbookStep]) -> List[RunbookStep]:
        for i, step in enumerate(steps):
            if i > 0:
                # Basic sequential dependency for demonstration
                step.prerequisites = [steps[i - 1].step_id]
        return steps
