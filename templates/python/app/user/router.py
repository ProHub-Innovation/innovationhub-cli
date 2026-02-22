import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.auth.enums import Role
from app.core.database import get_db
from app.user import service as user_service
from app.user.models import User
from app.user.schemas import (
    CreateUserRequest,
    QueryUsersParams,
    UpdateUserRequest,
    UserResponse,
)

router = APIRouter(prefix="/users", tags=["users"])


# --- Rotas do próprio usuário ---


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retorna o perfil do usuário logado",
    responses={200: {"description": "Perfil do usuário."}},
)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.get_user_by_id(db, current_user.id)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Atualiza o perfil do usuário logado",
    responses={200: {"description": "Perfil atualizado com sucesso."}},
)
async def update_me(
    data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.update_user_profile(db, current_user.id, data)


# --- Rotas administrativas ---


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo usuário (admin)",
    responses={201: {"description": "Usuário criado com sucesso."}},
)
async def create_user(
    data: CreateUserRequest,
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.create_user(db, data)


@router.get(
    "/",
    response_model=list[UserResponse],
    summary="Busca todos os usuários",
    responses={200: {"description": "Lista de usuários retornada com sucesso."}},
)
async def find_all(
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.get_all_users(db)


@router.get(
    "/paginated",
    summary="Busca todos os usuários com paginação",
    responses={200: {"description": "Lista de usuários retornada com sucesso."}},
)
async def find_paginated(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    sort_by: str = Query("id"),
    sort_order: str = Query("ASC"),
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    from app.common.schemas import SortOrder as SortOrderEnum

    query = QueryUsersParams(
        page=page,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=SortOrderEnum(sort_order.upper()),
    )
    return await user_service.get_users_paginated(db, query)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Busca usuário pelo Id",
    responses={
        200: {"description": "Usuário encontrado."},
        404: {"description": "Usuário não encontrado."},
    },
)
async def find_by_id(
    user_id: uuid.UUID,
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.get_user_by_id(db, user_id)


@router.patch(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Atualiza um usuário pelo ID (admin)",
    responses={204: {"description": "Usuário atualizado com sucesso."}},
)
async def update_user(
    user_id: uuid.UUID,
    data: UpdateUserRequest,
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    await user_service.update_user_profile(db, user_id, data)


@router.patch(
    "/{user_id}/reset-password",
    summary="Reseta a senha de um usuário (admin)",
    responses={
        200: {"description": "Senha resetada com sucesso."},
        404: {"description": "Usuário não encontrado."},
    },
)
async def reset_password(
    user_id: uuid.UUID,
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.reset_password_by_admin(db, user_id)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deleta um usuário (admin)",
    responses={
        204: {"description": "Usuário deletado com sucesso."},
        404: {"description": "Usuário não encontrado."},
    },
)
async def delete_user(
    user_id: uuid.UUID,
    _admin: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    await user_service.delete_user(db, user_id)
