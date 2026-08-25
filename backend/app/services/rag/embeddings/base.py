from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """
    Abstract interface for Embedding Providers.
    Allows swapping between OpenAI, NVIDIA NIM, HuggingFace, etc.
    """

    @abstractmethod
    def embed_text(self, text: str) -> list[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        pass
