import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.core.rate_limiter import limiter

@pytest.fixture(autouse=True)
def reset_rate_limit():
    """Clear rate limit memory storage between tests to prevent cascading 429 errors."""
    limiter._storage.reset()
