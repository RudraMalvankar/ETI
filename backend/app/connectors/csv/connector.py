from typing import List

from app.connectors.base import BaseConnector


class CSVConnector(BaseConnector):
    def connect(self) -> bool:
        return True

    def fetch_documents(self) -> List[bytes]:
        return []
