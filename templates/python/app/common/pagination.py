from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Metadados de paginação."""

    total_items: int
    item_count: int
    items_per_page: int
    total_pages: int
    current_page: int


class PaginatedResult(BaseModel, Generic[T]):
    """Resultado paginado genérico."""

    data: list[T]
    meta: PaginationMeta
