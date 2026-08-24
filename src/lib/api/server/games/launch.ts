import "server-only";

import type { GameLaunchInput, GameLaunchResult } from "@/types/games";
import {
  mapScorpioLaunch,
  type ScorpioLaunchRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function launchGame(
  token: string,
  input: GameLaunchInput
): Promise<GameLaunchResult> {
  const { endpoints } = getApiConfig();

  const res = await backendFetch(endpoints.gameLaunch, {
    method: "POST",
    headers: bearerAuthHeaders(token),
    body: JSON.stringify({
      playerExternalId: input.playerExternalId,
      providerId: input.providerId,
      gameCode: input.gameCode,
      language: input.language ?? "en",
      currency: input.currency ?? "USD",
      returnUrl: input.returnUrl,
      rtp: input.rtp ?? 0,
    }),
  });

  const raw = await parseApiResponse<ScorpioLaunchRaw>(res);
  return mapScorpioLaunch(raw);
}
