from .base import AIProvider
from .mock_provider import MockAIProvider
from .gemini_provider import GeminiProvider
from .nim_provider import NIMProvider
from app.core.config import settings

class ProviderFactory:
    """
    Factory to return the configured AIProvider instance.
    Determined dynamically by settings.AI_PROVIDER.
    """
    _cached_provider = None

    @classmethod
    def get_provider(cls) -> AIProvider:
        if cls._cached_provider is not None:
            return cls._cached_provider

        provider_type = settings.AI_PROVIDER.lower()
        
        if provider_type == "gemini":
            cls._cached_provider = GeminiProvider()
        elif provider_type == "nim":
            cls._cached_provider = NIMProvider()
        else:
            cls._cached_provider = MockAIProvider()

        return cls._cached_provider

    @classmethod
    def reset(cls):
        """Reset cached provider instance (useful for testing config changes)"""
        cls._cached_provider = None
