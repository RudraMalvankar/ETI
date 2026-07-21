from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from app.database.session import Base

class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"

    token = Column(String(500), primary_key=True, index=True)
    blacklisted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
