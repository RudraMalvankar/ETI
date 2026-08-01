import os


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
        # SECURITY: Strip directory components to prevent path traversal attacks.
        # A malicious filename like "../../etc/passwd" would write outside upload_dir.
        safe_filename = os.path.basename(filename)
        if not safe_filename:
            raise ValueError("Invalid filename: must not be empty after sanitization")

        target_path = os.path.join(self.upload_dir, safe_filename)

        # Double-check: resolved path must stay within upload_dir
        upload_dir_resolved = os.path.realpath(self.upload_dir)
        target_resolved = os.path.realpath(target_path)
        if not target_resolved.startswith(upload_dir_resolved + os.sep) and target_resolved != upload_dir_resolved:
            raise ValueError(f"Path traversal detected: resolved path escapes upload directory")

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
