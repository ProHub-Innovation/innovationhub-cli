import uuid
from typing import Generic, TypeVar

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.base_model import BaseModel
from app.common.pagination import PaginatedResult, PaginationMeta

T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    """Repositório base genérico."""

    def __init__(self, model: type[T], session: AsyncSession):
        self.model = model
        self.session = session

    async def find_all(self) -> list[T]:
        stmt = select(self.model).order_by(desc(self.model.created_at))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_by_id(self, id: uuid.UUID) -> T | None:
        return await self.session.get(self.model, id)

    async def create(self, data: dict) -> T:
        entity = self.model(**data)
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    async def update(self, id: uuid.UUID, data: dict) -> T | None:
        entity = await self.find_by_id(id)
        if not entity:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(entity, key, value)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    async def delete(self, id: uuid.UUID) -> None:
        entity = await self.find_by_id(id)
        if entity:
            await self.session.delete(entity)
            await self.session.flush()

    async def find_all_paginated(
        self,
        page: int = 1,
        limit: int = 10,
        order_by: str = "created_at",
        order_dir: str = "DESC",
    ) -> PaginatedResult[T]:
        # Contagem total
        count_stmt = select(func.count()).select_from(self.model)
        total_result = await self.session.execute(count_stmt)
        total_items = total_result.scalar() or 0

        # Query paginada
        column = getattr(self.model, order_by, self.model.created_at)
        order = desc(column) if order_dir.upper() == "DESC" else column.asc()

        stmt = select(self.model).order_by(order).offset((page - 1) * limit).limit(limit)
        result = await self.session.execute(stmt)
        data = list(result.scalars().all())

        total_pages = (total_items + limit - 1) // limit if limit > 0 else 0

        return PaginatedResult(
            data=data,
            meta=PaginationMeta(
                total_items=total_items,
                item_count=len(data),
                items_per_page=limit,
                total_pages=total_pages,
                current_page=page,
            ),
        )
