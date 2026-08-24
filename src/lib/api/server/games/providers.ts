import "server-only";

import type { Provider, ProviderSettings } from "@/types/games";
import {
  mapScorpioProvider,
  mapScorpioProviderSettings,
  type ScorpioPlatformProviderRaw,
  type ScorpioProviderSettingsRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { backendFetch, parseApiResponse } from "../http";

export async function fetchProviders(): Promise<Provider[]> {
  try {
    const { endpoints } = getApiConfig();

    const res = await backendFetch(endpoints.providerList, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const raw = await parseApiResponse<ScorpioPlatformProviderRaw[]>(res);

    if (!Array.isArray(raw)) return [];

    return raw.map(mapScorpioProvider);
  } catch {
    return [];
  }
}

export async function fetchProviderSettings(): Promise<ProviderSettings> {
  try {
    const { endpoints } = getApiConfig();

    const res = await backendFetch(endpoints.providerSettings, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const raw = await parseApiResponse<ScorpioProviderSettingsRaw>(res);
    return mapScorpioProviderSettings(raw);
  } catch {
    return {
      lobbyshow: false,
      promoshow: false,
      slotMinBet: 0,
      slotmaxBet: 0,
    };
  }
}
