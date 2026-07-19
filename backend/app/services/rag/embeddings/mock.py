from .base import EmbeddingProvider
from typing import List
import numpy as np

class MockEmbeddingProvider(EmbeddingProvider):
    """
    Generates deterministic pseudo-random vectors based on string hash.
    Useful for testing RAG pipelines without burning API credits.
    """
    def __init__(self, dim: int = 1536):
        self._dim = dim
        
    def embed_text(self, text: str) -> List[float]:
        # Pseudo-random but deterministic based on hash for testing similarity
        seed = abs(hash(text)) % (2**32)
        np.random.seed(seed)
        vec = np.random.randn(self._dim)
        vec = vec / np.linalg.norm(vec)
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

    @property
    def dimension(self) -> int:
        return self._dim
