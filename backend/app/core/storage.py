import os
import shutil

class StorageManager:
    """
    Abstractions for local or cloud file systems storage (e.g. S3/MinIO).
    """
    def __init__(self):
        self.upload_dir = os.environ.get("STORAGE_DIR", "storage_uploads")
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)

    def save_file(self, filename: str, content: bytes) -> str:
        """Save raw binary file data and return storage path."""
        target_path = os.path.join(self.upload_dir, filename)
        with open(target_path, "wb") as f:
            f.write(content)
        return target_path

    def get_file_content(self, filepath: str) -> bytes:
        """Read and return saved file binary contents."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Stored file not found: {filepath}")
        with open(filepath, "rb") as f:
            return f.read()

global_storage_manager = StorageManager()
