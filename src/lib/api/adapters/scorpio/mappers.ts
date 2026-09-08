import type { AuthSession, Game, GameCategory, User } from "@/types";
import type { Provider, ProviderSettings } from "@/types/games";
import { resolveAvatarUrl, resolveGameImage } from "@/lib/game-image";
import { SITE_BRAND } from "@/lib/site-copy";
import type {
  DepositMethod,
  DepositRecord,
  DepositResult,
  DepositStatus,
} from "@/types/deposit";
import type { PlayerBalance, PlayerBalanceEntry } from "@/types/player";
import type { ContactTicketResult } from "@/types/support";
import type {
  TransactionRecord,
  TransactionStatus,
  TransactionType,
  WalletTransferResult,
} from "@/types/wallet";
import type {
  ScorpioAuthRaw,
  ScorpioContactResultRaw,
  ScorpioDepositRecordRaw,
  ScorpioDepositResultRaw,
  ScorpioGameRaw,
  ScorpioLaunchRaw,
  ScorpioPlatformGameRaw,
  ScorpioPlatformProviderRaw,
  ScorpioPlayerBalanceEntryRaw,
  ScorpioPlayerBalanceRaw,
  ScorpioProviderSettingsRaw,
  ScorpioTransactionRecordRaw,
  ScorpioUserRaw,
  ScorpioWalletTransferRaw,
} from "./types";

const DEPOSIT_METHODS: DepositMethod[] = ["bank", "card", "paypal", "crypto"];
const DEPOSIT_STATUSES: DepositStatus[] = ["pending", "completed", "failed"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategory(): GameCategory {
  return "slots";
}

function mapPlatformGameType(): GameCategory {
  return "slots";
}

export function mapScorpioProvider(raw: ScorpioPlatformProviderRaw): Provider {
  const providerId = Number(raw.providerId ?? raw.id ?? 0);

  return {
    providerId,
    providerName: raw.providerName ?? raw.name ?? "Unknown",
    logo: raw.logo ?? "",
    status: Number(raw.status ?? 0),
  };
}

export function mapScorpioProviderSettings(
  raw: ScorpioProviderSettingsRaw
): ProviderSettings {
  return {
    lobbyshow: Boolean(raw.lobbyshow),
    promoshow: Boolean(raw.promoshow),
    slotMinBet: Number(raw.slotMinBet ?? 0),
    slotmaxBet: Number(raw.slotmaxBet ?? 0),
  };
}

export function mapScorpioPlatformGame(
  raw: ScorpioPlatformGameRaw,
  context: {
    providerId: string;
    providerName: string;
  }
): Game {
  const gameCode = raw.gameCode ?? raw.gameID ?? "unknown";
  const title = raw.gameName ?? gameCode;
  const id = `${context.providerId}_${gameCode}`;
  const slug = slugify(`${context.providerId}-${gameCode}`);

  return {
    id,
    slug,
    title,
    shortDescription: raw.description?.trim() || title,
    description: raw.description?.trim() || title,
    category: mapPlatformGameType(),
    platforms: ["web"],
    priceCents: 0,
    coinPrice: 0,
    coverImage: resolveGameImage(raw.gameImage, slug),
    bannerImage: resolveGameImage(raw.gameImage, `${slug}-banner`),
    tags: [context.providerName],
    releaseDate: "",
    developer: raw.providerName ?? context.providerName,
    minPlayers: 1,
    maxPlayers: 1,
    playMode: "browser" as const,
  };
}

export function mapScorpioCatalogGame(raw: ScorpioPlatformGameRaw): Game {
  return mapScorpioPlatformGame(raw, {
    providerId: String(raw.providerId ?? "0"),
    providerName: raw.providerName ?? SITE_BRAND.name,
  });
}

function normalizePlayMode(): Game["playMode"] {
  return "browser";
}

function normalizeDepositMethod(raw?: string): DepositMethod {
  const value = raw?.toLowerCase();
  if (value && DEPOSIT_METHODS.includes(value as DepositMethod)) {
    return value as DepositMethod;
  }
  return "crypto";
}

function normalizeDepositStatus(raw?: string): DepositStatus {
  if (raw && DEPOSIT_STATUSES.includes(raw as DepositStatus)) {
    return raw as DepositStatus;
  }
  return "completed";
}

export function mapScorpioGame(raw: ScorpioGameRaw): Game {
  const title = raw.title ?? raw.name ?? "Untitled Game";
  const id =
    raw.id ??
    raw.scp_game_id ??
    raw.slug ??
    slugify(title) ??
    "unknown";
  const slug = raw.slug ?? slugify(title) ?? String(id);
  const coverSource =
    raw.coverImage ?? raw.cover_image ?? raw.thumbnail;
  const bannerSource =
    raw.bannerImage ?? raw.banner_image ?? coverSource;

  return {
    id: String(id),
    slug,
    title,
    shortDescription:
      raw.shortDescription ??
      raw.short_description ??
      title,
    description: raw.description ?? raw.shortDescription ?? title,
    category: normalizeCategory(),
    platforms: (raw.platforms?.length ? raw.platforms : ["web"]) as Game["platforms"],
    priceCents: raw.priceCents ?? raw.price_cents ?? 0,
    coinPrice: raw.coinPrice ?? raw.coin_price ?? 0,
    coverImage: resolveGameImage(coverSource, slug),
    bannerImage: resolveGameImage(bannerSource, `${slug}-banner`),
    tags: raw.tags ?? [],
    releaseDate: raw.releaseDate ?? raw.release_date ?? "",
    developer:
      raw.developer ?? raw.scp_game_provider_name ?? SITE_BRAND.name,
    minPlayers: raw.minPlayers ?? raw.min_players ?? 1,
    maxPlayers: raw.maxPlayers ?? raw.max_players ?? 1,
    playMode: normalizePlayMode(),
  };
}

export function mapScorpioGames(raw: ScorpioGameRaw[] | unknown): Game[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapScorpioGame);
}

const PREFERRED_BALANCE_CURRENCIES = ["USD", "USDT", "EUR"];

function mapBalanceEntry(
  raw: ScorpioPlayerBalanceEntryRaw
): PlayerBalanceEntry | null {
  const currency = raw.currency?.trim().toUpperCase();
  const amount = Number(raw.amount ?? 0);
  if (!currency || !Number.isFinite(amount)) return null;
  return { currency, amount };
}

function pickPrimaryBalance(
  balances: PlayerBalanceEntry[]
): PlayerBalanceEntry {
  if (balances.length === 0) {
    return { currency: "USD", amount: 0 };
  }

  for (const preferred of PREFERRED_BALANCE_CURRENCIES) {
    const match = balances.find((entry) => entry.currency === preferred);
    if (match) return match;
  }

  return balances[0];
}

export function mapScorpioPlayerBalance(
  raw: ScorpioPlayerBalanceRaw
): PlayerBalance {
  const playerCode = Number(raw.playerCode ?? raw.player_code ?? 0);

  const balances = (raw.balance ?? raw.balances ?? [])
    .map(mapBalanceEntry)
    .filter((entry): entry is PlayerBalanceEntry => entry !== null);

  if (
    typeof raw.balanceCents === "number" ||
    typeof raw.balance_cents === "number"
  ) {
    const currency = raw.currency?.trim().toUpperCase() || "USD";
    const balanceCents = Number(raw.balanceCents ?? raw.balance_cents ?? 0);
    return {
      playerCode,
      balanceCents,
      currency,
      balances:
        balances.length > 0
          ? balances
          : [{ currency, amount: balanceCents / 100 }],
    };
  }

  const primary = pickPrimaryBalance(balances);

  return {
    playerCode,
    balanceCents: Math.round(primary.amount * 100),
    currency: primary.currency,
    balances,
  };
}

export function applyPlayerBalanceToUser(
  user: User,
  balance: PlayerBalance
): User {
  return {
    ...user,
    balanceCents: balance.balanceCents,
    currency: balance.currency,
    playerCode: balance.playerCode || user.playerCode,
    balances: balance.balances,
  };
}

export function mapScorpioLaunch(raw: ScorpioLaunchRaw): { gameUrl: string } {
  const gameUrl = raw.gameUrl ?? raw.game_url ?? raw.url;
  if (!gameUrl) {
    throw new Error("Launch response did not include a game URL.");
  }
  return { gameUrl };
}

function resolveUserBalance(raw: ScorpioUserRaw): {
  balanceCents: number;
  currency: string;
} {
  const currency = raw.currency?.trim().toUpperCase() || "USD";

  if (typeof raw.balanceCents === "number") {
    return { balanceCents: raw.balanceCents, currency };
  }
  if (typeof raw.balance_cents === "number") {
    return { balanceCents: raw.balance_cents, currency };
  }

  const legacyBalance = raw.coinBalance ?? raw.coin_balance ?? 0;
  return {
    balanceCents: Math.round(Number(legacyBalance) * 100),
    currency,
  };
}

export function mapScorpioUser(raw: ScorpioUserRaw): User {
  const id = raw.id ?? "unknown";
  const displayName =
    raw.displayName ?? raw.display_name ?? raw.email ?? "Player";
  const { balanceCents, currency } = resolveUserBalance(raw);
  return {
    id: String(id),
    email: raw.email ?? "",
    displayName,
    username: raw.username ?? raw.user_login,
    avatarUrl: resolveAvatarUrl(
      raw.avatarUrl ?? raw.avatar_url,
      displayName
    ),
    balanceCents,
    currency,
    ownedGameIds: raw.ownedGameIds ?? raw.owned_game_ids ?? [],
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

export function mapScorpioAuth(raw: ScorpioAuthRaw): AuthSession {
  if (!raw.user || !raw.token) {
    throw new Error("Invalid auth response from backend.");
  }
  return {
    user: mapScorpioUser(raw.user),
    token: raw.token,
  };
}

function resolveDepositAmounts(raw: ScorpioDepositRecordRaw): {
  amountCents: number;
  priceCents: number;
  currency: string;
} {
  const currency = raw.currency?.trim().toUpperCase() || "USD";
  const amountCents =
    raw.amountCents ??
    raw.amount_cents ??
    raw.coinAmount ??
    raw.coin_amount ??
    0;
  const priceCents = raw.priceCents ?? raw.price_cents ?? 0;

  if (amountCents > 0 && priceCents > 0) {
    return { amountCents, priceCents, currency };
  }

  const amount = Number(raw.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { amountCents, priceCents, currency };
  }

  if (priceCents <= 0) {
    const cents = Math.round(amount * 100);
    return {
      amountCents: amountCents > 0 ? amountCents : cents,
      priceCents: cents,
      currency,
    };
  }

  return {
    amountCents: amountCents > 0 ? amountCents : priceCents,
    priceCents,
    currency,
  };
}

export function mapScorpioDepositRecord(
  raw: ScorpioDepositRecordRaw
): DepositRecord {
  const { amountCents, priceCents, currency } = resolveDepositAmounts(raw);
  const reference =
    raw.reference ??
    raw.txn_id ??
    raw.txnId ??
    raw.gateway_txn_id ??
    raw.gatewayTxnId;

  return {
    id: raw.id ?? raw.txn_id ?? raw.txnId ?? `dep-${Date.now()}`,
    userId: String(raw.userId ?? raw.user_id ?? ""),
    amountCents,
    currency,
    priceCents,
    method: normalizeDepositMethod(
      raw.method ?? raw.payment_method ?? raw.paymentMethod ?? raw.type
    ),
    status: normalizeDepositStatus(raw.status),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    reference,
  };
}

export function mapScorpioDepositResult(
  raw: ScorpioDepositResultRaw
): DepositResult {
  if (!raw.user || !raw.transaction) {
    throw new Error("Invalid deposit response from backend.");
  }
  return {
    user: mapScorpioUser(raw.user),
    transaction: mapScorpioDepositRecord(raw.transaction),
  };
}

export function mapScorpioDepositHistory(raw: unknown): DepositRecord[] {
  if (Array.isArray(raw)) {
    return raw.map(mapScorpioDepositRecord);
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of ["transactions", "deposits", "items", "list"]) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.map((item) =>
          mapScorpioDepositRecord(item as ScorpioDepositRecordRaw)
        );
      }
    }
  }

  return [];
}

export function mapScorpioContactResult(
  raw: ScorpioContactResultRaw
): ContactTicketResult {
  return {
    ticketId: raw.ticketId ?? raw.ticket_id ?? `TKT-${Date.now()}`,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    message: raw.message ?? "Your request was received.",
  };
}

const TRANSACTION_TYPES: TransactionType[] = ["deposit", "withdraw"];
const TRANSACTION_STATUSES: TransactionStatus[] = [
  "pending",
  "completed",
  "failed",
];

function normalizeTransactionType(raw?: string): TransactionType {
  const value = raw?.toLowerCase();
  if (value === "withdrawal") return "withdraw";
  if (value && TRANSACTION_TYPES.includes(value as TransactionType)) {
    return value as TransactionType;
  }
  return "deposit";
}

function normalizeTransactionStatus(raw?: string): TransactionStatus {
  if (raw && TRANSACTION_STATUSES.includes(raw as TransactionStatus)) {
    return raw as TransactionStatus;
  }
  return "completed";
}

function resolveTransactionAmountCents(raw: ScorpioTransactionRecordRaw): number {
  if (typeof raw.amountCents === "number") return raw.amountCents;
  if (typeof raw.amount_cents === "number") return raw.amount_cents;

  const amount = Number(raw.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  return Math.round(amount * 100);
}

export function mapScorpioTransaction(
  raw: ScorpioTransactionRecordRaw
): TransactionRecord {
  const reference =
    raw.reference ?? raw.txn_id ?? raw.txnId ?? undefined;

  return {
    id: String(raw.id ?? raw.txn_id ?? raw.txnId ?? `tx-${Date.now()}`),
    userId: String(raw.userId ?? raw.user_id ?? ""),
    type: normalizeTransactionType(raw.type),
    amountCents: resolveTransactionAmountCents(raw),
    currency: raw.currency?.trim().toUpperCase() || "USD",
    status: normalizeTransactionStatus(raw.status),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    reference,
  };
}

export function mapScorpioTransactionHistory(
  raw: unknown
): TransactionRecord[] {
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      mapScorpioTransaction(item as ScorpioTransactionRecordRaw)
    );
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of ["transactions", "deposits", "withdrawals", "items", "list"]) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.map((item) =>
          mapScorpioTransaction(item as ScorpioTransactionRecordRaw)
        );
      }
    }
  }

  return [];
}

export function mapScorpioWalletTransfer(
  raw: ScorpioWalletTransferRaw,
  kind: "deposit" | "withdraw"
): WalletTransferResult {
  const currency = raw.currency?.trim().toUpperCase() || "USD";
  const balance = Number(raw.balance ?? 0);
  const depositAmount = Number(raw.depositAmount ?? raw.deposit_amount ?? 0);
  const withdrawAmount = Number(raw.withdrawAmount ?? raw.withdraw_amount ?? 0);
  const transferAmount =
    kind === "withdraw"
      ? withdrawAmount || depositAmount
      : depositAmount || withdrawAmount;

  return {
    currency,
    balance,
    transferAmount,
  };
}
