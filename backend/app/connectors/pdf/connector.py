from app.connectors.base import BaseConnector


class PDFConnector(BaseConnector):
    """
    Handles fetching PDFs from cloud storage, local paths, or SFTP.
    """

    def connect(self) -> bool:
        return True

    def fetch_documents(self) -> list[bytes]:
        # Implement fetching from AWS S3 or Blob Storage
        return []
