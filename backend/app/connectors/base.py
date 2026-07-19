from abc import ABC, abstractmethod
from typing import List
from app.schemas.document import IngestedDocument

class BaseConnector(ABC):
    """
    Abstract interface for Connectors ensuring standard data ingress.
    """
    @abstractmethod
    def fetch_documents(self) -> List[bytes]:
        pass
        
    @abstractmethod
    def connect(self) -> bool:
        pass
