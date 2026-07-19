from app.services.rag.vector_store import global_vector_store

class Retriever:
    """
    Retrieves industrial document chunks relevant to the incident.
    """
    def retrieve_context(self, failed_asset: str, failure_type: str, top_k: int = 3):
        query = f"{failed_asset} {failure_type} maintenance troubleshooting"
        results = global_vector_store.search(query=query, top_k=top_k, asset_id=failed_asset)
        return results
