import uuid

from pydantic import BaseModel, EmailStr, Field

from app.auth.enums import Role


class LoginRequest(BaseModel):

    email: EmailStr
    password: str


class LoginResponse(BaseModel):

    access_token: str
    refresh_token: str
    expires_in: int
    refresh_expires_in: int
    user: "UserOut"



class RefreshTokenRequest(BaseModel):

    refresh_token: str



class ChangePasswordRequest(BaseModel):

    old_password: str
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str


# --- User schemas (para evitar import circular, definimos aqui) ---


class UserOut(BaseModel):
    """Schema de saída do usuário (sem password)."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    name: str
    phone: str | None = None
    is_active: bool
    role: Role
    must_change_password: bool


# Resolve forward reference
LoginResponse.model_rebuild()
