from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.common.base_model import BaseModel


class RefreshToken(BaseModel):
    """Entidade de refresh token."""

    __tablename__ = "refresh_tokens"

    jti: str = Column(String, unique=True, nullable=False)
    hashed_token: str = Column(String, nullable=False)
    is_revoked: bool = Column(Boolean, default=False, nullable=False)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="refresh_tokens")
