/**
 * Game catalog and session types (proxied via backend API).
 */

export interface Provider {
  providerId: number;
  providerName: string;
  logo: string;
  status: number;
}

export interface ProviderSettings {
  lobbyshow: boolean;
  promoshow: boolean;
  slotMinBet: number;
  slotmaxBet: number;
}

export interface GameLaunchInput {
  playerExternalId: string;
  providerId: number;
  gameCode: string;
  language?: string;
  currency?: string;
  returnUrl?: string;
  rtp?: number;
}

export interface GameLaunchResult {
  gameUrl: string;
}

export interface GameKickInput {
  playerExternalId: string;
}
