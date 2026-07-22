from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.schemas.document import DocumentChunk


class Chunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""],
        )

    def chunk_document(self, pages: List[DocumentChunk]) -> List[DocumentChunk]:
        """
        Takes page-level chunks and breaks them down into smaller, semantic chunks suitable for RAG.
        """
        final_chunks = []
        for page in pages:
            text_splits = self.splitter.split_text(page.text)
            for i, split in enumerate(text_splits):
                new_chunk = page.model_copy(deep=True)
                new_chunk.chunk_id = f"{page.chunk_id}-{i}"
                new_chunk.text = split
                final_chunks.append(new_chunk)

        return final_chunks
