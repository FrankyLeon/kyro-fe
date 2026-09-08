import "server-only";

import type { Game } from "@/types";
import {
  mapScorpioPlatformGame,
  type ScorpioPlatformGameRaw,
  type ScorpioPlatformProviderRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { SITE_BRAND } from "@/lib/site-copy";
import { launchGameCodeFromId, parseGameSlug } from "@/lib/game-slug";
import { backendFetch, parseApiResponse } from "../http";

let cachedGames: Game[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchProviderGames(
  provider: ScorpioPlatformProviderRaw
): Promise<Game[]> {
  const providerId = provider.providerId ?? provider.id;
  if (providerId === undefined || providerId === null) return [];

  const providerName = provider.providerName ?? provider.name ?? SITE_BRAND.name;
  const { endpoints } = getApiConfig();

  try {
    const res = await backendFetch(endpoints.gameList(providerId), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const rawGames = await parseApiResponse<ScorpioPlatformGameRaw[]>(res);

    if (!Array.isArray(rawGames)) return [];

    return rawGames
      .filter((game) => game.status === 1 || game.status === "1")
      .map((game) =>
        mapScorpioPlatformGame(game, {
          providerId: String(providerId),
          providerName,
        })
      );
  } catch {
    return [];
  }
}

export async function fetchAllGames(): Promise<Game[]> {
  const now = Date.now();
  if (cachedGames && now < cacheExpiresAt) {
    return cachedGames;
  }

  try {
    const { endpoints } = getApiConfig();
    const res = await backendFetch(endpoints.providerList, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const providers = await parseApiResponse<ScorpioPlatformProviderRaw[]>(res);

    if (!Array.isArray(providers) || providers.length === 0) {
      return [];
    }
    const activeProviders = providers.filter(
      (provider) => provider.status === 1 || provider.status === "1"
    );

    const lists = await Promise.all(
      (activeProviders.length ? activeProviders : providers).map(
        fetchProviderGames
      )
    );

    const games = lists.flat().sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );

    cachedGames = games;
    cacheExpiresAt = now + CACHE_TTL_MS;

    return games;
  } catch {
    // Backend game routes may not be ready yet — render an empty catalog.
    return [];
  }
}

export async function fetchGameBySlug(slug: string): Promise<Game | null> {
  const parsed = parseGameSlug(slug);
  if (!parsed) return null;

  const games = await fetchAllGames();
  const match = games.find((game) => game.slug === slug);
  if (match) return match;

  try {
    const { endpoints } = getApiConfig();
    const res = await backendFetch(endpoints.gameList(parsed.providerId), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const rawGames = await parseApiResponse<ScorpioPlatformGameRaw[]>(res);
    if (!Array.isArray(rawGames)) return null;

    const raw = rawGames.find((game) => {
      const code =
        String(game.gameCode ?? "").trim() ||
        launchGameCodeFromId(
          String(game.gameID ?? ""),
          String(parsed.providerId)
        );
      return code.toLowerCase() === parsed.gameCode.toLowerCase();
    });

    if (!raw) return null;

    return mapScorpioPlatformGame(raw, {
      providerId: String(parsed.providerId),
      providerName: raw.providerName ?? SITE_BRAND.name,
    });
  } catch {
    return null;
  }
}

export function resetGamesCache(): void {
  cachedGames = null;
  cacheExpiresAt = 0;
}
