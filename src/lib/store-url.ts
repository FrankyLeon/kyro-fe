import type { GameSort } from "@/lib/game-search";

export interface StoreQueryParams {
  q?: string;
  provider?: string;
  sort?: GameSort;
  page?: number;
}

export function buildStoreUrl(
  params: StoreQueryParams = {},
  options?: { hash?: boolean }
): string {
  const search = new URLSearchParams();

  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }
  if (params.provider?.trim()) {
    search.set("provider", params.provider.trim());
  }
  if (params.sort && params.sort !== "rating") {
    search.set("sort", params.sort);
  }
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();
  const path = query ? `/store?${query}` : "/store";
  return options?.hash ? `${path}#games` : path;
}
