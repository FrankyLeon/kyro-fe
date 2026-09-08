import type { Game } from "@/types";
import type { GameSort } from "@/lib/game-search";

export interface GameCatalogQuery {
  q?: string;
  provider?: string;
  sort?: GameSort;
  offset?: number;
  limit?: number;
}

export interface GameCatalogPage {
  items: Game[];
  total: number;
}

export function buildCatalogSearchParams(
  query: GameCatalogQuery = {}
): URLSearchParams {
  const search = new URLSearchParams();

  if (query.q?.trim()) search.set("q", query.q.trim());
  if (query.provider?.trim()) search.set("provider", query.provider.trim());
  if (query.sort) search.set("sort", query.sort);
  if (query.offset && query.offset > 0) {
    search.set("offset", String(query.offset));
  }
  if (query.limit && query.limit > 0) {
    search.set("limit", String(query.limit));
  }

  return search;
}
