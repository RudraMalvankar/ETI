from app.connectors.base import BaseConnector
from typing import List

class CSVConnector(BaseConnector):
    def connect(self) -> bool:
        return True
        
    def fetch_documents(self) -> List[bytes]:
        return []
