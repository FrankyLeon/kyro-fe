import "server-only";

import type { Game } from "@/types";
import { fetchAllGames, fetchGameBySlug } from "./catalog";

export { fetchAllGames, fetchGameBySlug, resetGamesCache } from "./catalog";
export { fetchGameCatalog } from "./catalog-page";
export { kickGame } from "./kick";
export { launchGame } from "./launch";
export { fetchProviders, fetchProviderSettings } from "./providers";
export { parseGameSlug } from "./slug";

export interface GameFilters {
  search?: string;
}

function filterGames(games: Game[], filters?: GameFilters): Game[] {
  if (!filters?.search) return [...games];

  const q = filters.search.toLowerCase();
  return games.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q)) ||
      g.developer.toLowerCase().includes(q)
  );
}

export async function fetchGames(filters?: GameFilters): Promise<Game[]> {
  const games = await fetchAllGames();
  return filterGames(games, filters);
}
