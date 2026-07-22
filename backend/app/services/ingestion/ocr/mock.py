import time
from typing import Any, Dict, List

from .base import OCRProvider


class MockOCRProvider(OCRProvider):
    """
    Mock OCR Provider for development and hackathon demonstration.
    Simulates latency and returns fake extracted text.
    """

    def extract_text(self, image_bytes: bytes) -> str:
        # Simulate OCR latency
        time.sleep(0.5)
        return "MOCK_OCR_TEXT: ⚠️ CAUTION: High Pressure Valve V-102 operating parameters exceeded limits during Q3 inspection."

    def extract_tables(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        return [{"columns": ["Sensor", "Value"], "rows": [["Pressure", "150 PSI"]]}]
