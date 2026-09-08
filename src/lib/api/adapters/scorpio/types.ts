/** Raw game from ScorpioPlay platform API (`/v1/game/list/:providerId`). */
export interface ScorpioPlatformGameRaw {
  providerId?: number | string;
  gameCode?: string;
  gameID?: string;
  gameName?: string;
  gameType?: number | string;
  gameImage?: string;
  description?: string;
  status?: number | string;
  inMaintenance?: boolean;
  providerName?: string;
}

/** Raw provider from ScorpioPlay platform API (`/v1/provider/list`). */
export interface ScorpioPlatformProviderRaw {
  providerId?: number | string;
  id?: number | string;
  providerName?: string;
  name?: string;
  logo?: string;
  status?: number | string;
}

/** Raw provider settings from ScorpioPlay platform API (`/v1/provider/settings`). */
export interface ScorpioProviderSettingsRaw {
  lobbyshow?: boolean;
  promoshow?: boolean;
  slotMinBet?: number;
  slotmaxBet?: number;
}

/** Raw game payload from scorpioplay-core REST (field names may vary by WP version). */
export interface ScorpioGameRaw {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  scp_game_id?: string;
  shortDescription?: string;
  short_description?: string;
  description?: string;
  category?: string;
  scp_game_category?: string;
  coverImage?: string;
  cover_image?: string;
  thumbnail?: string;
  bannerImage?: string;
  banner_image?: string;
  platforms?: string[];
  priceCents?: number;
  price_cents?: number;
  coinPrice?: number;
  coin_price?: number;
  tags?: string[];
  releaseDate?: string;
  release_date?: string;
  developer?: string;
  scp_game_provider_name?: string;
  minPlayers?: number;
  min_players?: number;
  maxPlayers?: number;
  max_players?: number;
  playMode?: "browser" | "desktop" | "both";
  play_mode?: "browser" | "desktop" | "both";
}

export interface ScorpioLaunchRaw {
  gameUrl?: string;
  game_url?: string;
  url?: string;
}

export interface ScorpioUserRaw {
  id?: string | number;
  email?: string;
  displayName?: string;
  display_name?: string;
  username?: string;
  user_login?: string;
  avatarUrl?: string;
  avatar_url?: string;
  coinBalance?: number;
  coin_balance?: number;
  balanceCents?: number;
  balance_cents?: number;
  currency?: string;
  ownedGameIds?: string[];
  owned_game_ids?: string[];
  createdAt?: string;
  created_at?: string;
}

export interface ScorpioAuthRaw {
  user?: ScorpioUserRaw;
  token?: string;
}

export interface ScorpioDepositRecordRaw {
  id?: string;
  userId?: string;
  user_id?: string;
  coinAmount?: number;
  coin_amount?: number;
  amountCents?: number;
  amount_cents?: number;
  priceCents?: number;
  price_cents?: number;
  amount?: number | string;
  method?: string;
  payment_method?: string;
  paymentMethod?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  reference?: string;
  txn_id?: string;
  txnId?: string;
  gateway_txn_id?: string;
  gatewayTxnId?: string;
  currency?: string;
}

export interface ScorpioDepositResultRaw {
  user?: ScorpioUserRaw;
  transaction?: ScorpioDepositRecordRaw;
}

export interface ScorpioContactResultRaw {
  ticketId?: string;
  ticket_id?: string;
  createdAt?: string;
  created_at?: string;
  message?: string;
}

/** Raw balance entry from `GET /transaction/list`. */
export interface ScorpioPlayerBalanceEntryRaw {
  currency?: string;
  amount?: number | string;
}

/** Raw player balance from `GET /player/balance` (or Scorpio `/v1/player/info`). */
export interface ScorpioPlayerBalanceRaw {
  playerCode?: number | string;
  player_code?: number | string;
  balance?: ScorpioPlayerBalanceEntryRaw[];
  balances?: ScorpioPlayerBalanceEntryRaw[];
  balanceCents?: number;
  balance_cents?: number;
  currency?: string;
}

/** Raw transaction from `GET /wallet/transactions`. */
export interface ScorpioTransactionRecordRaw {
  id?: string | number;
  txn_id?: string;
  txnId?: string;
  userId?: string;
  user_id?: string;
  type?: string;
  amount?: number | string;
  amountCents?: number;
  amount_cents?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  reference?: string;
  method?: string;
  payment_method?: string;
}

/** Raw wallet transfer payload from the backend API. */
export interface ScorpioWalletTransferRaw {
  currency?: string;
  balance?: number;
  depositAmount?: number;
  deposit_amount?: number;
  withdrawAmount?: number;
  withdraw_amount?: number;
}
