from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.schemas.document import DocumentChunk
from app.schemas.search import SearchResultChunk
from app.services.rag.embeddings.base import EmbeddingProvider
from app.services.rag.embeddings.gemini_embedding import AdaptiveEmbeddingProvider
import os
from typing import List, Optional

class VectorStoreService:
    def __init__(self, collection_name: str = None, embedding_provider: EmbeddingProvider = None):
        self.collection_name = collection_name or os.environ.get("QDRANT_COLLECTION", "apex_documents")
        self.embedding_provider = embedding_provider or AdaptiveEmbeddingProvider()
        
        qdrant_url = os.environ.get("QDRANT_URL")
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        qdrant_host = os.environ.get("QDRANT_HOST")
        
        if qdrant_url:
            print(f"Connecting to Cloud Qdrant: {qdrant_url}")
            self.client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        elif qdrant_host:
            print(f"Connecting to Local Qdrant: {qdrant_host}:6333")
            self.client = QdrantClient(host=qdrant_host, port=6333)
        else:
            print("Connecting to In-Memory Qdrant")
            self.client = QdrantClient(":memory:")
            
        self._init_collection()

    def _init_collection(self):
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.embedding_provider.dimension, 
                    distance=models.Distance.COSINE
                )
            )

    def index_chunks(self, chunks: List[DocumentChunk]):
        if not chunks:
            return
            
        texts = [c.text for c in chunks]
        vectors = self.embedding_provider.embed_batch(texts)
        
        points = []
        for i, chunk in enumerate(chunks):
            import uuid
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.chunk_id))
            
            payload = chunk.model_dump()
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=vectors[i],
                    payload=payload
                )
            )
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(self, query: str, top_k: int = 5, asset_id: Optional[str] = None, document_id: Optional[str] = None) -> List[SearchResultChunk]:
        query_vector = self.embedding_provider.embed_text(query)
        
        must_conditions = []
        if asset_id:
            must_conditions.append(models.FieldCondition(key="asset_id", match=models.MatchValue(value=asset_id)))
        if document_id:
            must_conditions.append(models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id)))
            
        query_filter = models.Filter(must=must_conditions) if must_conditions else None

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=top_k,
            with_payload=True
        ).points
        
        parsed_results = []
        for hit in results:
            payload = hit.payload
            parsed_results.append(SearchResultChunk(
                chunk_id=payload.get("chunk_id", ""),
                document_id=payload.get("document_id", ""),
                page_number=payload.get("page_number"),
                asset_id=payload.get("asset_id"),
                text=payload.get("text", ""),
                metadata=payload.get("metadata", {}),
                score=hit.score
            ))
            
        return parsed_results

# Export singleton instance
global_vector_store = VectorStoreService()
