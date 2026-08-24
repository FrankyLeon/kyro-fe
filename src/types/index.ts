export type GameCategory = "slots";

export type Platform = "web" | "windows" | "mac" | "linux";

export type PaymentMethod = "coins" | "card" | "crypto" | "paypal";

export interface Game {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: GameCategory;
  platforms: Platform[];
  priceCents: number;
  coinPrice: number;
  coverImage: string;
  bannerImage: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  tags: string[];
  releaseDate: string;
  developer: string;
  minPlayers: number;
  maxPlayers: number;
  playMode: "browser" | "desktop" | "both";
}

import type { PlayerBalanceEntry } from "./player";

export interface User {
  id: string;
  email: string;
  displayName: string;
  /** Backend login — used as platform `playerExternalId`. */
  username?: string;
  avatarUrl: string;
  /** Primary wallet balance in smallest currency unit (e.g. cents for USD). */
  balanceCents: number;
  currency: string;
  /** Platform player code from `GET /transaction/list`. */
  playerCode?: number;
  /** All balance entries returned by `GET /transaction/list`. */
  balances?: PlayerBalanceEntry[];
  ownedGameIds: string[];
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
