import Fuse, { type IFuseOptions } from "fuse.js";
import type { Game } from "@/types";

export type GameSort = "az" | "za";

export const GAME_SORT_OPTIONS: { value: GameSort; label: string }[] = [
  { value: "az", label: "A To Z" },
  { value: "za", label: "Z To A" },
];

export interface GameSearchOptions {
  query?: string;
  provider?: string;
  sort?: GameSort;
}

const FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "developer", weight: 0.3 },
    { name: "tags", weight: 0.12 },
    { name: "shortDescription", weight: 0.08 },
  ],
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
} satisfies IFuseOptions<Game>;

export function parseGameSort(value?: string | null): GameSort {
  return value === "za" ? "za" : "az";
}

export function listGameProviders(games: Game[]): string[] {
  return [...new Set(games.map((game) => game.developer).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}

export function createGameSearchIndex(games: Game[]): Fuse<Game> {
  return new Fuse(games, FUSE_OPTIONS);
}

export function searchGames(
  games: Game[],
  fuse: Fuse<Game>,
  options: GameSearchOptions = {}
): Game[] {
  const query = options.query?.trim() ?? "";
  const provider = options.provider?.trim() ?? "";
  const sort = options.sort ?? "az";

  let result = query
    ? (() => {
        const matchedIds = new Set(
          fuse.search(query).map((match) => match.item.id)
        );
        return games.filter((game) => matchedIds.has(game.id));
      })()
    : [...games];

  if (provider) {
    const needle = provider.toLowerCase();
    result = result.filter(
      (game) => game.developer.toLowerCase() === needle
    );
  }

  result.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );
  if (sort === "za") result.reverse();

  return result;
}

export function getSearchSuggestions(
  fuse: Fuse<Game>,
  query: string,
  limit = 6
): Game[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  return fuse
    .search(trimmed, { limit: limit * 2 })
    .map((match) => match.item)
    .slice(0, limit);
}

export interface HighlightSegment {
  text: string;
  match: boolean;
}

export function splitHighlight(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim();
  if (!trimmed) return [{ text, match: false }];

  const pattern = trimmed
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .split(/\s+/)
    .filter(Boolean)
    .join("|");

  if (!pattern) return [{ text, match: false }];

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex).filter(Boolean);
  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  return parts.map((part) => ({
    text: part,
    match: terms.some((term) => part.toLowerCase().includes(term)),
  }));
}
