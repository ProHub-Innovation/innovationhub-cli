from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, String
from sqlalchemy.orm import relationship

from app.auth.enums import Role
from app.common.base_model import BaseModel


class User(BaseModel):

    __tablename__ = "users"

    email: str = Column(String, unique=True, nullable=False, index=True)
    name: str = Column(String, nullable=False)
    phone: str | None = Column(String, nullable=True)
    password: str = Column(String, nullable=False)
    is_active: bool = Column(Boolean, default=True, nullable=False)
    role: str = Column(Enum(Role, name="role_enum"), default=Role.USER, nullable=False)
    must_change_password: bool = Column(Boolean, default=False, nullable=False)
    deleted_at: datetime | None = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
