from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import service as auth_service
from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RefreshTokenRequest,
)
from app.core.database import get_db
from app.user.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Autentica um usuário",
    responses={200: {"description": "Usuário autenticado com sucesso."}},
)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, data.email, data.password)


@router.post(
    "/logout",
    status_code=200,
    summary="Faz logout do usuário",
    responses={200: {"description": "Logout realizado com sucesso."}},
)
async def logout(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.logout(db, data.refresh_token)
    return {"message": "Logout realizado com sucesso."}


@router.post(
    "/refresh",
    response_model=LoginResponse,
    summary="Atualiza os tokens de acesso",
    responses={
        200: {"description": "Tokens atualizados com sucesso."},
        401: {"description": "O refresh token é inválido ou expirou."},
    },
)
async def refresh_tokens(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh_tokens(db, data.refresh_token)


@router.patch(
    "/change-password",
    response_model=MessageResponse,
    summary="Altera a senha do usuário logado",
    responses={
        200: {"description": "Senha alterada com sucesso."},
        401: {"description": "Não autorizado."},
        400: {"description": "Requisição inválida."},
    },
)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await auth_service.change_password(db, current_user.id, data)
