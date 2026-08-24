/**
 * Balance entry from `GET /player/balance`.
 * Platform path: `/v1/player/info?playerExternalId=...`
 */
export interface PlayerBalanceEntry {  currency: string;
  amount: number;
}

/** Player balance payload from the backend API. */
export interface PlayerBalance {
  playerCode: number;
  /** Primary balance in smallest currency unit (e.g. cents for USD). */
  balanceCents: number;
  currency: string;
  balances: PlayerBalanceEntry[];
}
