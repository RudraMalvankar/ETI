from abc import ABC, abstractmethod
from typing import Any, Dict, List


class OCRProvider(ABC):
    """
    Abstract interface for OCR providers.
    Allows hot-swapping between NVIDIA NIM, Surya, Tesseract, etc.
    """

    @abstractmethod
    def extract_text(self, image_bytes: bytes) -> str:
        """Extract plain text from an image."""
        pass

    @abstractmethod
    def extract_tables(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """Extract structured tables from an image."""
        pass

    def get_last_result_metadata(self) -> Dict[str, Any]:
        """Optional metadata about the last OCR operation, such as confidence or model details."""
        return {}
