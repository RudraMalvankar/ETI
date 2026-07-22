from typing import List

from app.schemas.runbook import RunbookStep


class CitationMapper:
    """
    Maps citations from the decision payload to applicable steps.
    """

    def map_citations(self, steps: List[RunbookStep], citations: List[dict]) -> List[RunbookStep]:
        normalized_citations = [
            {
                "document_id": c.get("document_id", ""),
                "chunk_id": c.get("chunk_id", ""),
                "snippet": c.get("text_snippet", ""),
            }
            for c in citations
        ]

        if not normalized_citations:
            return steps

        for step in steps:
            if step.priority in {2, 3}:
                step.document_citations = normalized_citations
        return steps
