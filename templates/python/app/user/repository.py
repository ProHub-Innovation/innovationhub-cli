import uuid

from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.base_repository import BaseRepository
from app.common.pagination import PaginatedResult, PaginationMeta
from app.user.models import User
from app.user.schemas import QueryUsersParams


class UserRepository(BaseRepository[User]):
    """Repositório de usuários."""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def find_by_id(self, id: uuid.UUID) -> User | None:
        """Busca usuário ativo (sem soft delete) pelo ID."""
        stmt = select(User).where(User.id == id, User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_all(self) -> list[User]:
        """Busca todos os usuários ativos."""
        stmt = select(User).where(User.deleted_at.is_(None)).order_by(desc(User.created_at))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_by_email(self, email: str) -> User | None:
        """Busca usuário pelo email."""
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_and_count_users(self, query: QueryUsersParams) -> PaginatedResult[User]:
        """Busca paginada com filtro por nome/email."""
        base_stmt = select(User).where(User.deleted_at.is_(None))
        count_stmt = select(func.count()).select_from(User).where(User.deleted_at.is_(None))

        if query.search:
            search_filter = or_(
                User.name.ilike(f"%{query.search}%"),
                User.email.ilike(f"%{query.search}%"),
            )
            base_stmt = base_stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        # Whitelist de colunas para ordenação
        allowed_columns = {"id", "name", "email", "is_active", "role", "created_at"}
        sort_col = query.sort_by if query.sort_by in allowed_columns else "created_at"
        column = getattr(User, sort_col, User.created_at)
        order = desc(column) if query.sort_order.value == "DESC" else column.asc()

        base_stmt = base_stmt.order_by(order)
        base_stmt = base_stmt.offset((query.page - 1) * query.limit).limit(query.limit)

        total_result = await self.session.execute(count_stmt)
        total_items = total_result.scalar() or 0

        result = await self.session.execute(base_stmt)
        users = list(result.scalars().all())

        total_pages = (total_items + query.limit - 1) // query.limit if query.limit > 0 else 0

        return PaginatedResult(
            data=users,
            meta=PaginationMeta(
                total_items=total_items,
                item_count=len(users),
                items_per_page=query.limit,
                total_pages=total_pages,
                current_page=query.page,
            ),
        )

    async def soft_delete(self, id: uuid.UUID) -> None:
        """Soft delete (marca deleted_at)."""
        from datetime import UTC, datetime

        user = await self.find_by_id(id)
        if user:
            user.deleted_at = datetime.now(UTC)
            await self.session.flush()
