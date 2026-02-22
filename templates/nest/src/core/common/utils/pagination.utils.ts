export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Constrói o objeto de metadados de paginação.
 *
 * @param totalItems - Total de registros no banco
 * @param page - Página atual
 * @param limit - Itens por página
 * @param itemCount - Quantidade de itens retornados nesta página
 */
export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number,
  itemCount: number,
): PaginationMeta {
  return {
    totalItems,
    itemCount,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  };
}
