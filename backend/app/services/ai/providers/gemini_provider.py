import os
from typing import List
import google.generativeai as genai
from .base import AIProvider
from app.core.config import settings

class GeminiProvider(AIProvider):
    """
    Google Gemini API provider implementation.
    Generates text completions using gemini-1.5-flash and embeddings using text-embedding-004.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured in settings or environment variables.")
        genai.configure(api_key=self.api_key)
        self.model_name = settings.GEMINI_MODEL
        self.embedding_model_name = settings.GEMINI_EMBEDDING_MODEL

    def complete(self, prompt: str, system_prompt: str = "") -> str:
        # Configure model
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt if system_prompt else None
        )
        response = model.generate_content(prompt)
        return response.text

    def embed(self, text: str) -> List[float]:
        result = genai.embed_content(
            model=self.embedding_model_name,
            content=text,
            task_type="retrieval_document"
        )
        return result["embedding"]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        result = genai.embed_content(
            model=self.embedding_model_name,
            content=texts,
            task_type="retrieval_document"
        )
        return result["embedding"]
