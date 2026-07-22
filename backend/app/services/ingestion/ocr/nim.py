import base64
import json
from typing import Any, Dict, List

import httpx

from app.core.config import settings

from .base import OCRProvider


class NIMOCRProvider(OCRProvider):
    def __init__(self):
        if not settings.NIM_API_KEY:
            raise ValueError("NIM_API_KEY is not configured for OCR operations.")

        self.base_url = settings.NIM_BASE_URL.rstrip("/")
        self.model = settings.NIM_OCR_MODEL
        self.client = httpx.Client(
            headers={"Authorization": f"Bearer {settings.NIM_API_KEY}"},
            timeout=60.0,
        )
        self._last_metadata: Dict[str, Any] = {
            "provider": "nim",
            "model": self.model,
            "ocr_confidence": None,
        }

    def _send_prompt(self, image_bytes: bytes, instruction: str, max_tokens: int = 2048) -> str:
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": instruction},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{image_b64}"},
                        },
                    ],
                }
            ],
            "temperature": 0,
            "max_tokens": max_tokens,
            "stream": False,
        }

        response = self.client.post(f"{self.base_url}/chat/completions", json=payload)
        response.raise_for_status()
        data = response.json()
        self._last_metadata = {
            "provider": "nim",
            "model": self.model,
            "ocr_confidence": None,
            "usage": data.get("usage", {}),
        }
        return data["choices"][0]["message"]["content"].strip()

    def extract_text(self, image_bytes: bytes) -> str:
        return self._send_prompt(
            image_bytes,
            (
                "Extract all readable text from this industrial document image. "
                "Preserve tag numbers, equipment identifiers, warnings, and table values. "
                "Return plain text only with no markdown fences."
            ),
        )

    def extract_tables(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        raw = self._send_prompt(
            image_bytes,
            (
                "Inspect this industrial document image for tables. "
                "Return only JSON in the format "
                '[{"title":"string","columns":["string"],"rows":[["string"]]}]. '
                "If no table exists, return []."
            ),
            max_tokens=1024,
        )

        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = "\n".join(cleaned.splitlines()[1:-1]).strip()

        try:
            parsed = json.loads(cleaned)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    def get_last_result_metadata(self) -> Dict[str, Any]:
        return self._last_metadata
