import Fuse, { type IFuseOptions } from "fuse.js";
import type { Game } from "@/types";

export interface GameSearchOptions {
  query?: string;
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

export function createGameSearchIndex(games: Game[]): Fuse<Game> {
  return new Fuse(games, FUSE_OPTIONS);
}

export function searchGames(
  games: Game[],
  fuse: Fuse<Game>,
  options: GameSearchOptions = {}
): Game[] {
  const query = options.query?.trim() ?? "";
  if (!query) return games;

  const matches = fuse.search(query);
  const matchedIds = new Set(matches.map((match) => match.item.id));

  return games.filter((game) => matchedIds.has(game.id));
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
