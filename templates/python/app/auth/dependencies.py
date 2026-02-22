import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.enums import Role
from app.common.errors import ERRORS
from app.core.config import settings
from app.core.database import get_db

security = HTTPBearer()


def create_access_token(user_id: uuid.UUID, email: str, role: str) -> str:
    """Cria um JWT access token."""
    expire = datetime.now(UTC) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def create_refresh_token(user_id: uuid.UUID, email: str, role: str, jti: str) -> str:
    """Cria um JWT refresh token."""
    expire = datetime.now(UTC) + timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "jti": jti,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_REFRESH_SECRET, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    """Decodifica e valida um access token."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["INVALID_TOKEN"],
        ) from exc


def decode_refresh_token(token: str) -> dict:
    """Decodifica e valida um refresh token."""
    try:
        return jwt.decode(token, settings.JWT_REFRESH_SECRET, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ERRORS["AUTH"]["ACCESS_DENIED"],
        ) from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Dependency que extrai e valida o usuário atual do token JWT."""
    from app.user.models import User

    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["INVALID_TOKEN"],
        )

    user = await db.get(User, uuid.UUID(user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["INVALID_TOKEN"],
        )

    if user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["ACCOUNT_DELETED"],
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["ACCOUNT_DISABLED"],
        )

    return user


def require_role(*roles: Role):
    """
    Dependency factory que verifica se o usuário tem um dos papéis necessários.

    Uso: @router.get("/", dependencies=[Depends(require_role(Role.ADMIN))])
    """

    async def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ERRORS["AUTH"]["ACCESS_DENIED"],
            )
        return current_user

    return role_checker
