from abc import ABC, abstractmethod
from typing import List

class AIProvider(ABC):
    """
    Abstract Base Class representing an AI Provider.
    Ensures standard generation and embedding interfaces across Gemini, NVIDIA NIM, and Mock providers.
    """
    @abstractmethod
    def complete(self, prompt: str, system_prompt: str = "") -> str:
        """
        Run text completion against the provider's primary LLM.
        """
        pass

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """
        Generate vector embedding for a single text string.
        """
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate vector embeddings for a list of text strings.
        """
        pass
