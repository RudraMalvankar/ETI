from typing import List
from app.schemas.runbook import RunbookStep

class CitationMapper:
    """
    Maps citations from the decision payload to applicable steps.
    """
    def map_citations(self, steps: List[RunbookStep], citations: List[dict]) -> List[RunbookStep]:
        for step in steps:
            if citations:
                # For demonstration, attach the first citation to the primary strategy step
                if step.priority == 2:
                    step.document_citations = [{
                        "document_id": c.get("document_id", ""),
                        "snippet": c.get("text_snippet", "")
                    } for c in citations]
        return steps
