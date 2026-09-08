export const STORE_GRID_COLUMNS = 7;
export const STORE_INITIAL_ROWS = 10;
export const STORE_MORE_ROWS = 6;
export const STORE_INITIAL_SIZE = STORE_GRID_COLUMNS * STORE_INITIAL_ROWS;
export const STORE_MORE_SIZE = STORE_GRID_COLUMNS * STORE_MORE_ROWS;
export const STORE_PAGE_SIZE = STORE_INITIAL_SIZE;
export const HOME_POPULAR_ROWS = 2;
export const HOME_POPULAR_SIZE = STORE_GRID_COLUMNS * HOME_POPULAR_ROWS;

export function storeVisibleCount(page: number): number {
  const safePage = Math.max(1, page);
  if (safePage === 1) return STORE_INITIAL_SIZE;
  return STORE_INITIAL_SIZE + (safePage - 1) * STORE_MORE_SIZE;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize = STORE_PAGE_SIZE
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return {
    items: items.slice(startIndex, endIndex),
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages,
      start: total === 0 ? 0 : startIndex + 1,
      end: endIndex,
      hasPrevious: safePage > 1,
      hasNext: safePage < totalPages,
    },
  };
}

export function parsePageParam(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export type PaginationItem = number | "ellipsis";

/** Compact page list with ellipsis, e.g. [1, "ellipsis", 4, 5, 6, "ellipsis", 12]. */
export function getPaginationRange(
  current: number,
  totalPages: number,
  siblingCount = 1
): PaginationItem[] {
  if (totalPages <= 1) return totalPages === 1 ? [1] : [];

  const pages: number[] = [];

  for (let page = 1; page <= totalPages; page++) {
    if (
      page === 1 ||
      page === totalPages ||
      (page >= current - siblingCount && page <= current + siblingCount)
    ) {
      pages.push(page);
    }
  }

  const result: PaginationItem[] = [];
  let previous: number | undefined;

  for (const page of pages) {
    if (previous !== undefined) {
      if (page - previous === 2) {
        result.push(previous + 1);
      } else if (page - previous > 2) {
        result.push("ellipsis");
      }
    }
    result.push(page);
    previous = page;
  }

  return result;
}
