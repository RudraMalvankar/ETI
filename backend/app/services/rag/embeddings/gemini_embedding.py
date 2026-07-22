from typing import List

from app.services.ai.providers.factory import ProviderFactory

from .base import EmbeddingProvider


class AdaptiveEmbeddingProvider(EmbeddingProvider):
    """
    Adapts the active AIProvider (Gemini/NIM/Mock) from ProviderFactory
    to the RAG EmbeddingProvider interface.
    """

    def __init__(self, fallback_dim: int = 1536):
        self._fallback_dim = fallback_dim

    def embed_text(self, text: str) -> List[float]:
        provider = ProviderFactory.get_provider()
        return provider.embed(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        provider = ProviderFactory.get_provider()
        return provider.embed_batch(texts)

    @property
    def dimension(self) -> int:
        # Dynamically determine dimensions based on active provider
        from app.services.ai.providers.gemini_provider import GeminiProvider
        from app.services.ai.providers.nim_provider import NIMProvider

        provider = ProviderFactory.get_provider()
        if isinstance(provider, GeminiProvider):
            return 768  # text-embedding-004 has 768 dimensions by default
        elif isinstance(provider, NIMProvider):
            return 1024  # nvidia/embed-qa-4 has 1024 dimensions

        # Mock embedding provider has 1536
        return self._fallback_dim
