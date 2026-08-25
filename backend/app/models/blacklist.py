from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, String

from app.database.session import Base


class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"

    token = Column(String(500), primary_key=True, index=True)
    blacklisted_at = Column(DateTime, default=lambda: datetime.now(UTC))
