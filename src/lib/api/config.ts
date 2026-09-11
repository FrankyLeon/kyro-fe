/** REST paths under the backend API namespace — change here when routes change. */
export interface ApiEndpoints {
  providerList: string;
  providerSettings: string;
  gameList: (providerId: string | number) => string;
  gameCatalog: string;
  gameLaunch: string;
  gameKick: string;
  walletDeposit: string;
  walletDepositDestinations: string;
  walletWithdrawDestinations: string;
  walletWithdraw: string;
  walletTransactions: string;
  playerBalance: string;
  supportContact: string;
}

export interface ApiConfig {
  /** Backend API origin, e.g. http://localhost/scorpio */
  baseUrl: string;
  /** REST namespace, e.g. /wp-json/scp/v1 */
  prefix: string;
  endpoints: ApiEndpoints;
}

const DEFAULT_PREFIX = "/wp-json/scp/v1";

const defaultEndpoints: ApiEndpoints = {
  providerList: "/provider/list",
  providerSettings: "/provider/settings",
  gameList: (providerId) =>
    `/game/list/${encodeURIComponent(String(providerId))}`,
  gameCatalog: "/game/catalog",
  gameLaunch: "/game/launch",
  gameKick: "/game/kick",
  walletDeposit: "/wallet/deposit",
  walletDepositDestinations: "/wallet/deposit-destinations",
  walletWithdrawDestinations: "/wallet/withdraw-destinations",
  walletWithdraw: "/wallet/withdraw",
  walletTransactions: "/wallet/transactions",
  playerBalance: "/player/balance",
  supportContact: "/support/contact",
};

let cachedConfig: ApiConfig | null = null;

export function getApiConfig(): ApiConfig {
  if (cachedConfig) return cachedConfig;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const prefix = process.env.NEXT_PUBLIC_API_PREFIX ?? DEFAULT_PREFIX;

  cachedConfig = {
    baseUrl,
    prefix: prefix.startsWith("/") ? prefix : `/${prefix}`,
    endpoints: defaultEndpoints,
  };

  return cachedConfig;
}

/** Full URL for a REST path segment (path should start with `/`). */
export function buildApiUrl(path: string): string {
  const { baseUrl, prefix } = getApiConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${prefix}${normalizedPath}`;
}

/** Reset cached config (useful in tests). */
export function resetApiConfigCache(): void {
  cachedConfig = null;
}
