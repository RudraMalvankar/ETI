from typing import List, Optional

import structlog
from qdrant_client import QdrantClient
from qdrant_client.http import models

from app.core.config import settings
from app.schemas.document import DocumentChunk
from app.schemas.search import SearchResultChunk
from app.services.rag.embeddings.base import EmbeddingProvider
from app.services.rag.embeddings.gemini_embedding import AdaptiveEmbeddingProvider

logger = structlog.get_logger("apex.vector_store")


class VectorStoreService:
    def __init__(self, collection_name: str = None, embedding_provider: EmbeddingProvider = None):
        self.collection_name = collection_name or settings.QDRANT_COLLECTION
        self.embedding_provider = embedding_provider or AdaptiveEmbeddingProvider()

        qdrant_url = settings.QDRANT_URL
        qdrant_api_key = settings.QDRANT_API_KEY
        qdrant_host = settings.QDRANT_HOST

        if qdrant_url:
            logger.info("qdrant_connecting", mode="cloud", url=qdrant_url)
            self.client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        elif qdrant_host:
            logger.info("qdrant_connecting", mode="local", host=qdrant_host)
            self.client = QdrantClient(host=qdrant_host, port=settings.QDRANT_PORT)
        else:
            logger.info("qdrant_connecting", mode="in_memory")
            self.client = QdrantClient(":memory:")

        self._init_collection()

    def _init_collection(self):
        try:
            collection = self.client.get_collection(self.collection_name)
        except Exception:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.embedding_provider.dimension,
                    distance=models.Distance.COSINE,
                ),
            )
            self._ensure_payload_indexes()
            return

        vector_config = getattr(getattr(collection, "config", None), "params", None)
        configured_vectors = getattr(vector_config, "vectors", None) if vector_config else None
        current_size = getattr(configured_vectors, "size", None) if configured_vectors else None
        expected_size = self.embedding_provider.dimension
        points_count = getattr(collection, "points_count", 0) or 0

        if current_size == expected_size:
            self._ensure_payload_indexes()
            return

        if points_count == 0:
            logger.warning(
                "qdrant_collection_recreating_for_dimension_mismatch",
                collection=self.collection_name,
                current_size=current_size,
                expected_size=expected_size,
            )
            self.client.delete_collection(self.collection_name)
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=expected_size,
                    distance=models.Distance.COSINE,
                ),
            )
            self._ensure_payload_indexes()
            return

        raise RuntimeError(
            f"Existing Qdrant collection '{self.collection_name}' uses vector size "
            f"{current_size}, but the active embedding provider requires {expected_size}. "
            "The collection is not empty, so it was not recreated automatically."
        )

    def _ensure_payload_indexes(self):
        for field_name in ("document_id", "asset_id", "chunk_id"):
            try:
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name=field_name,
                    field_schema=models.PayloadSchemaType.KEYWORD,
                )
            except Exception as exc:
                logger.warning(
                    "qdrant_payload_index_ensure_failed",
                    collection=self.collection_name,
                    field=field_name,
                    error=str(exc),
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
            points.append(models.PointStruct(id=point_id, vector=vectors[i], payload=payload))

        self.client.upsert(collection_name=self.collection_name, points=points)

    def search(
        self,
        query: str,
        top_k: int = 5,
        asset_id: Optional[str] = None,
        document_id: Optional[str] = None,
    ) -> List[SearchResultChunk]:
        query_vector = self.embedding_provider.embed_text(query)

        must_conditions = []
        if asset_id:
            must_conditions.append(
                models.FieldCondition(key="asset_id", match=models.MatchValue(value=asset_id))
            )
        if document_id:
            must_conditions.append(
                models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id))
            )

        query_filter = models.Filter(must=must_conditions) if must_conditions else None

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=top_k,
            with_payload=True,
        ).points

        parsed_results = []
        for hit in results:
            payload = hit.payload
            parsed_results.append(
                SearchResultChunk(
                    chunk_id=payload.get("chunk_id", ""),
                    document_id=payload.get("document_id", ""),
                    page_number=payload.get("page_number"),
                    asset_id=payload.get("asset_id"),
                    text=payload.get("text", ""),
                    metadata=payload.get("metadata", {}),
                    score=hit.score,
                )
            )

        return parsed_results


# Export singleton instance
global_vector_store = VectorStoreService()
