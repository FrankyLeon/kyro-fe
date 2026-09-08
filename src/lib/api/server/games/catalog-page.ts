import "server-only";

import {
  mapScorpioCatalogGame,
  type ScorpioPlatformGameRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { backendFetch, parseApiResponse } from "../http";
import {
  buildCatalogSearchParams,
  type GameCatalogPage,
  type GameCatalogQuery,
} from "@/lib/game-catalog";

export async function fetchGameCatalog(
  query: GameCatalogQuery = {}
): Promise<GameCatalogPage> {
  try {
    const { endpoints } = getApiConfig();
    const search = buildCatalogSearchParams(query);
    const path = search.toString()
      ? `${endpoints.gameCatalog}?${search.toString()}`
      : endpoints.gameCatalog;

    const res = await backendFetch(path, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const raw = await parseApiResponse<{
      items?: ScorpioPlatformGameRaw[];
      total?: number;
    }>(res);

    const items = Array.isArray(raw.items)
      ? raw.items
          .filter((game) => game.status === 1 || game.status === "1")
          .map(mapScorpioCatalogGame)
      : [];

    return {
      items,
      total: Number(raw.total ?? items.length) || 0,
    };
  } catch {
    return { items: [], total: 0 };
  }
}
