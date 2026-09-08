import type { Game } from "@/types";

/** Site brand — single source of truth for display name and related copy. */
export const SITE_BRAND = {
  name: "Kyro",
  tagline: "Online Betting Platform",
  supportEmail: "support@kyro.io",
} as const;

/** Shared UI labels — keep CTAs and terminology consistent sitewide. */
export const SITE_CTA = {
  browseGames: "Browse games",
  playNow: "Play now",
  signIn: "Sign in",
  signInToPlay: "Sign in to play",
  viewAllGames: "View all games",
} as const;

export function formatProviderLabel(game: Pick<Game, "developer">): string {
  return game.developer;
}

export function formatCategoryLabel(category: Game["category"]): string {
  if (category === "slots") return "Reels Slots";
  return category;
}
