from abc import ABC, abstractmethod
from typing import List

class EmbeddingProvider(ABC):
    """
    Abstract interface for Embedding Providers.
    Allows swapping between OpenAI, NVIDIA NIM, HuggingFace, etc.
    """
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        pass
        
    @property
    @abstractmethod
    def dimension(self) -> int:
        pass
