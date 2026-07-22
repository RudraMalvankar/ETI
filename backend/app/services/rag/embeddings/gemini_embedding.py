from typing import List

from app.core.config import settings
from app.services.ai.providers.gemini_provider import GeminiProvider
from app.services.ai.providers.mock_provider import MockAIProvider
from app.services.ai.providers.nim_provider import NIMProvider

from .base import EmbeddingProvider


class AdaptiveEmbeddingProvider(EmbeddingProvider):
    """
    Adapts the active AIProvider (Gemini/NIM/Mock) from ProviderFactory
    to the RAG EmbeddingProvider interface.
    """

    def __init__(self, fallback_dim: int = 1536):
        self._fallback_dim = fallback_dim

    @staticmethod
    def _get_embedding_provider():
        provider_name = settings.EMBEDDING_PROVIDER
        if provider_name == "gemini":
            return GeminiProvider()
        if provider_name == "nim":
            return NIMProvider()
        return MockAIProvider()

    @staticmethod
    def _normalized_nim_embedding_model() -> str:
        model_name = settings.NIM_EMBED_MODEL
        if "/" in model_name:
            return model_name
        if model_name.startswith(("llama-", "nv-", "nemotron-")):
            return f"nvidia/{model_name}"
        return model_name

    def embed_text(self, text: str) -> List[float]:
        provider = self._get_embedding_provider()
        return provider.embed(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        provider = self._get_embedding_provider()
        return provider.embed_batch(texts)

    @property
    def dimension(self) -> int:
        # Prefer provider-truth over a potentially stale environment override.
        if settings.EMBEDDING_PROVIDER == "gemini":
            return 768  # text-embedding-004 has 768 dimensions by default

        if settings.EMBEDDING_PROVIDER == "nim":
            model_name = self._normalized_nim_embedding_model()
            if model_name == "nvidia/llama-nemotron-embed-1b-v2":
                return 2048
            if model_name == "nvidia/nv-embedqa-e5-v5":
                return 1024
            if model_name == "nvidia/embed-qa-4":
                return 1024

        if settings.EMBEDDING_DIMENSION > 0:
            return settings.EMBEDDING_DIMENSION

        # Mock embedding provider has 1536
        return self._fallback_dim
