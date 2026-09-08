import {
  buildCatalogSearchParams,
  type GameCatalogPage,
  type GameCatalogQuery,
} from "@/lib/game-catalog";

export async function fetchGameCatalog(
  query: GameCatalogQuery = {}
): Promise<GameCatalogPage> {
  const search = buildCatalogSearchParams(query);
  const path = search.toString()
    ? `/api/games/catalog?${search.toString()}`
    : "/api/games/catalog";

  const res = await fetch(path, { cache: "no-store" });
  const payload = (await res.json().catch(() => null)) as
    | GameCatalogPage
    | { message?: string }
    | null;

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : "Could not load games.";
    throw new Error(message || "Could not load games.");
  }

  const page = payload as GameCatalogPage;
  return {
    items: Array.isArray(page.items) ? page.items : [],
    total: Number(page.total ?? 0) || 0,
  };
}
