from app.core.config import settings

from .base import OCRProvider
from .mock import MockOCRProvider
from .nim import NIMOCRProvider


def get_ocr_provider() -> OCRProvider | None:
    provider = settings.OCR_PROVIDER.lower()

    if provider == "nim":
        return NIMOCRProvider()

    if provider == "mock" and settings.ENABLE_MOCK_OCR:
        return MockOCRProvider()

    return None
