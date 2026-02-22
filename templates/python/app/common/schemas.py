from enum import StrEnum

from pydantic import BaseModel, Field


class SortOrder(StrEnum):
    ASC = "ASC"
    DESC = "DESC"


class BaseQueryParams(BaseModel):
    """Parâmetros base de query com paginação e ordenação."""

    page: int = Field(default=1, ge=1, description="Número da página que deseja buscar.")
    limit: int = Field(
        default=10, ge=1, le=100, description="Quantidade de itens por página."
    )
    search: str | None = Field(default=None, description="Termo de busca.")
    sort_by: str = Field(default="created_at", description="Coluna de ordenação.")
    sort_order: SortOrder = Field(default=SortOrder.DESC, description="Direção da ordenação.")
