from abc import ABC, abstractmethod


class BaseConnector(ABC):
    """
    Abstract interface for Connectors ensuring standard data ingress.
    """

    @abstractmethod
    def fetch_documents(self) -> list[bytes]:
        pass

    @abstractmethod
    def connect(self) -> bool:
        pass
