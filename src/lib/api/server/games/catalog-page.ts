import "server-only";

import { createGameSearchIndex, searchGames } from "@/lib/game-search";
import type { GameCatalogPage, GameCatalogQuery } from "@/lib/game-catalog";
import { fetchAllGames } from "./catalog";

/** Paginated catalog for Store / Show more, built from the provider game lists. */
export async function fetchGameCatalog(
  query: GameCatalogQuery = {}
): Promise<GameCatalogPage> {
  const games = await fetchAllGames();
  const filtered = searchGames(games, createGameSearchIndex(games), {
    query: query.q,
    provider: query.provider,
    sort: query.sort ?? "az",
  });

  const offset = Math.max(0, query.offset ?? 0);
  const limit = query.limit && query.limit > 0 ? query.limit : filtered.length;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    total: filtered.length,
  };
}
