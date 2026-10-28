import type { Game } from "@/types";

/** Site brand — single source of truth for display name and related copy. */
export const SITE_BRAND = {
  name: "Kyro",
  tagline: "Online Betting Platform",
  supportEmail: "support@kyro.io",
} as const;

export function formatProviderLabel(game: Pick<Game, "developer">): string {
  return game.developer;
}

export function formatCategoryLabel(category: Game["category"]): string {
  if (category === "slots") return "Reels Slots";
  return category;
}
