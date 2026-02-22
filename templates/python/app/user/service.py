import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import hash_password
from app.common.errors import ERRORS
from app.common.pagination import PaginatedResult
from app.core.config import settings
from app.user.models import User
from app.user.repository import UserRepository
from app.user.schemas import CreateUserRequest, QueryUsersParams, UpdateUserRequest


async def create_user(db: AsyncSession, data: CreateUserRequest) -> User:
    """Cria um novo usuário com senha padrão."""
    repo = UserRepository(db)

    existing = await repo.find_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{ERRORS['USER']['EMAIL_IN_USE']} (Email: {data.email})",
        )

    default_password = settings.DEFAULT_PASSWORD
    if not default_password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERRORS["USER"]["DEFAULT_PASSWORD_NOT_SET"],
        )

    hashed = hash_password(default_password)

    return await repo.create({
        **data.model_dump(exclude_unset=True),
        "password": hashed,
        "must_change_password": True,
    })


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User:
    """Busca um usuário pelo ID, levantando 404 se não encontrado."""
    repo = UserRepository(db)
    user = await repo.find_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERRORS["USER"]["NOT_FOUND"],
        )
    return user


async def get_all_users(db: AsyncSession) -> list[User]:
    """Lista todos os usuários ativos."""
    repo = UserRepository(db)
    return await repo.find_all()


async def get_users_paginated(db: AsyncSession, query: QueryUsersParams) -> PaginatedResult[User]:
    """Lista usuários com paginação e busca."""
    repo = UserRepository(db)
    return await repo.find_and_count_users(query)


async def update_user_profile(
    db: AsyncSession, user_id: uuid.UUID, data: UpdateUserRequest
) -> User:
    """Atualiza o perfil de um usuário."""
    repo = UserRepository(db)
    user = await repo.find_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERRORS["USER"]["NOT_FOUND"],
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    await db.flush()
    await db.refresh(user)
    return user


async def reset_password_by_admin(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Reseta a senha de um usuário para a senha padrão."""
    user = await get_user_by_id(db, user_id)

    default_password = settings.DEFAULT_PASSWORD
    if not default_password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERRORS["USER"]["DEFAULT_PASSWORD_NOT_SET"],
        )

    user.password = hash_password(default_password)
    user.must_change_password = True
    await db.flush()

    return {"message": f"A senha do usuário {user.name} foi resetada com sucesso"}


async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> None:
    """Soft delete de um usuário."""
    repo = UserRepository(db)
    user = await repo.find_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERRORS["USER"]["NOT_FOUND"],
        )
    await repo.soft_delete(user_id)
