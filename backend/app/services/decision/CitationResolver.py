from typing import List, Dict, Any

class CitationResolver:
    """
    Validates citations returned by the LLM against the originally retrieved chunks.
    Ensures the LLM did not hallucinate documents.
    """
    def resolve_citations(self, llm_citations: List[Dict[str, Any]], retrieved_chunks: List[Any]) -> List[Dict[str, Any]]:
        valid_citations = []
        valid_chunk_ids = {c.chunk_id: c for c in retrieved_chunks}
        
        for cit in llm_citations:
            chunk_id = cit.get('chunk_id')
            if chunk_id in valid_chunk_ids:
                valid_citations.append({
                    "document_id": valid_chunk_ids[chunk_id].document_id,
                    "chunk_id": chunk_id,
                    "text_snippet": cit.get('text_snippet', valid_chunk_ids[chunk_id].text[:100])
                })
        return valid_citations
