from typing import Dict
from app.schemas.document import IngestedDocument

# In-memory mock database since Qdrant is out of scope for Milestone 2
DOCUMENTS_DB: Dict[str, IngestedDocument] = {}
