from typing import Any, Optional


class APEXException(Exception):
    """Base exception for all APEX domain errors."""

    def __init__(self, message: str, details: Optional[Any] = None, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.details = details or message
        self.status_code = status_code


class AIProviderError(APEXException):
    """Raised when an AI provider (Gemini, NIM, Mock) fails."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, details=details, status_code=502)


class VectorStoreError(APEXException):
    """Raised when Qdrant or vector index operations fail."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, details=details, status_code=503)


class DatabaseError(APEXException):
    """Raised when database operational errors occur."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, details=details, status_code=500)


class RedisCacheError(APEXException):
    """Raised when Redis caching or broker fails."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, details=details, status_code=503)
