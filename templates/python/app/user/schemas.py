import uuid

from pydantic import BaseModel, EmailStr, Field

from app.auth.enums import Role
from app.common.schemas import BaseQueryParams

# --- Create ---


class CreateUserRequest(BaseModel):
    """Schema para criação de usuário."""

    email: EmailStr
    name: str
    is_active: bool | None = True
    role: Role | None = Role.USER


# --- Update ---


class UpdateUserRequest(BaseModel):
    """Schema para atualização de usuário."""

    email: EmailStr | None = None
    name: str | None = None
    phone: str | None = None
    is_active: bool | None = None
    role: Role | None = None


# --- Response ---


class UserResponse(BaseModel):
    """Schema de resposta do usuário (sem password)."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    name: str
    phone: str | None = None
    is_active: bool
    role: Role
    must_change_password: bool


# --- Query ---


class QueryUsersParams(BaseQueryParams):
    """Query params para busca de usuários."""

    sort_by: str = Field(
        default="id",
        description="Coluna de ordenação.",
        json_schema_extra={"enum": ["id", "name", "email", "is_active", "role"]},
    )
