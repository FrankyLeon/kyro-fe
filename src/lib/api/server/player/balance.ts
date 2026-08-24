import "server-only";

import type { PlayerBalance } from "@/types/player";
import {
  mapScorpioPlayerBalance,
  type ScorpioPlayerBalanceRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function fetchPlayerBalance(
  token: string,
  playerExternalId: string
): Promise<PlayerBalance> {
  const { endpoints } = getApiConfig();
  const params = new URLSearchParams({
    playerExternalId: playerExternalId.trim(),
  });

  const res = await backendFetch(`${endpoints.playerBalance}?${params}`, {
    method: "GET",
    headers: bearerAuthHeaders(token),
  });

  const raw = await parseApiResponse<ScorpioPlayerBalanceRaw>(res);
  return mapScorpioPlayerBalance(raw);
}
