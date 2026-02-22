import uuid

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.auth.models import RefreshToken
from app.auth.schemas import ChangePasswordRequest, LoginResponse, MessageResponse, UserOut
from app.common.errors import ERRORS
from app.core.config import settings
from app.user.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def validate_user(db: AsyncSession, email: str, password: str) -> User:
    """Valida credenciais e retorna o usuário."""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["INVALID_CREDENTIALS"],
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


async def generate_auth_response(db: AsyncSession, user: User) -> LoginResponse:
    jti = str(uuid.uuid4())

    access_token = create_access_token(user.id, user.email, user.role)
    refresh_token = create_refresh_token(user.id, user.email, user.role, jti)

    # Salvar refresh token com hash
    hashed = hash_password(refresh_token)
    token_entity = RefreshToken(
        jti=jti,
        hashed_token=hashed,
        is_revoked=False,
        user_id=user.id,
    )
    db.add(token_entity)
    await db.flush()

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_EXPIRATION_MINUTES * 60,
        refresh_expires_in=settings.JWT_REFRESH_EXPIRATION_DAYS * 86400,
        user=UserOut.model_validate(user),
    )


async def login(db: AsyncSession, email: str, password: str) -> LoginResponse:
    """Autentica o usuário e retorna tokens."""
    user = await validate_user(db, email, password)
    return await generate_auth_response(db, user)


async def logout(db: AsyncSession, refresh_token: str) -> None:
    """Revoga o refresh token (logout)."""
    payload = decode_refresh_token(refresh_token)
    jti = payload.get("jti")
    if not jti:
        return

    stmt = select(RefreshToken).where(RefreshToken.jti == jti)
    result = await db.execute(stmt)
    token = result.scalar_one_or_none()

    if token:
        token.is_revoked = True
        await db.flush()


async def refresh_tokens(db: AsyncSession, refresh_token_str: str) -> LoginResponse:
    """Rotaciona os tokens (revoga o antigo, gera novos)."""
    payload = decode_refresh_token(refresh_token_str)
    jti = payload.get("jti")
    user_id = payload.get("sub")

    if not jti or not user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ERRORS["AUTH"]["ACCESS_DENIED"],
        )

    # Verificar se o token existe e não foi revogado
    stmt = select(RefreshToken).where(RefreshToken.jti == jti)
    result = await db.execute(stmt)
    token_record = result.scalar_one_or_none()

    if not token_record or token_record.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ERRORS["AUTH"]["ACCESS_DENIED"],
        )

    # Verificar hash do token
    if not verify_password(refresh_token_str, token_record.hashed_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ERRORS["AUTH"]["ACCESS_DENIED"],
        )

    # Revogar o token antigo
    token_record.is_revoked = True
    await db.flush()

    # Buscar usuário e gerar novos tokens
    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["NOT_FOUND"],
        )

    return await generate_auth_response(db, user)


async def change_password(
    db: AsyncSession, user_id: uuid.UUID, data: ChangePasswordRequest
) -> MessageResponse:
    """Altera a senha do usuário."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["NOT_FOUND"],
        )

    if not verify_password(data.old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["AUTH"]["OLD_PASSWORD_INCORRECT"],
        )

    if data.old_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERRORS["AUTH"]["PASSWORD_SAME_AS_OLD"],
        )

    user.password = hash_password(data.new_password)

    if user.must_change_password:
        user.must_change_password = False

    await db.flush()

    return MessageResponse(message=ERRORS["AUTH"]["PASSWORD_CHANGED"])
