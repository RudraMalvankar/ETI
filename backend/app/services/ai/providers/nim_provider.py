import os
import httpx
from typing import List
from .base import AIProvider
from app.core.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential

class NIMProvider(AIProvider):
    """
    NVIDIA NIM API provider implementation.
    Calls OpenAI-compatible endpoints hosted on build.nvidia.com using httpx.
    """
    def __init__(self):
        self.api_key = settings.NIM_API_KEY or os.environ.get("NIM_API_KEY", "")
        if not self.api_key:
            raise ValueError("NIM_API_KEY is not configured in settings or environment variables.")
        self.base_url = settings.NIM_BASE_URL
        self.model = settings.NIM_MODEL
        self.client = httpx.Client(
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=30.0
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def complete(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.base_url}/chat/completions"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024,
            "stream": False
        }

        response = self.client.post(url, json=payload)
        response.raise_for_status()
        res_data = response.json()
        return res_data["choices"][0]["message"]["content"]

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def embed(self, text: str) -> List[float]:
        # NVIDIA NIM embedding endpoint
        url = f"{self.base_url}/embeddings"
        payload = {
            "input": [text],
            "model": "nvidia/embed-qa-4",  # Default standard NIM embedding model
            "encoding_format": "float"
        }
        try:
            response = self.client.post(url, json=payload)
            response.raise_for_status()
            res_data = response.json()
            return res_data["data"][0]["embedding"]
        except Exception:
            # Fallback to a deterministic vector if embedding NIM fails
            from .mock_provider import MockAIProvider
            return MockAIProvider().embed(text)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        url = f"{self.base_url}/embeddings"
        payload = {
            "input": texts,
            "model": "nvidia/embed-qa-4",
            "encoding_format": "float"
        }
        try:
            response = self.client.post(url, json=payload)
            response.raise_for_status()
            res_data = response.json()
            return [item["embedding"] for item in res_data["data"]]
        except Exception:
            from .mock_provider import MockAIProvider
            return MockAIProvider().embed_batch(texts)

