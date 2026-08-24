import "server-only";

import type { Game } from "@/types";
import { fetchAllGames, fetchGameBySlug } from "./catalog";

export { fetchAllGames, fetchGameBySlug, resetGamesCache } from "./catalog";
export { kickGame } from "./kick";
export { launchGame } from "./launch";
export { fetchProviders, fetchProviderSettings } from "./providers";
export { parseGameSlug } from "./slug";

export interface GameFilters {
  search?: string;
  featured?: boolean;
}

function filterGames(games: Game[], filters?: GameFilters): Game[] {
  let result = [...games];
  if (filters?.featured) {
    result = result.filter((g) => g.featured);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)) ||
        g.developer.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function fetchGames(filters?: GameFilters): Promise<Game[]> {
  const games = await fetchAllGames();
  return filterGames(games, filters);
}
