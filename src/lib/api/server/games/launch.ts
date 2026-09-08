import "server-only";

import type { GameLaunchResult } from "@/types/games";
import {
  mapScorpioLaunch,
  type ScorpioLaunchRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";
import { parseGameSlug } from "@/lib/game-slug";

export interface ServerGameLaunchInput {
  slug: string;
  playerExternalId: string;
  returnUrl?: string;
  currency?: string;
  language?: string;
  rtp?: number;
}

export async function launchGame(
  token: string,
  input: ServerGameLaunchInput
): Promise<GameLaunchResult> {
  const { endpoints } = getApiConfig();
  const parsed = parseGameSlug(input.slug);
  if (!parsed) {
    throw new Error("Game not found.");
  }

  const body: Record<string, string | number> = {
    playerExternalId: input.playerExternalId,
    providerId: parsed.providerId,
    gameCode: parsed.gameCode,
    language: input.language || "en",
    currency: input.currency || "USD",
    rtp: Number.isFinite(input.rtp) ? Number(input.rtp) : 0,
  };
  if (input.returnUrl) {
    body.returnUrl = input.returnUrl;
  }

  const res = await backendFetch(endpoints.gameLaunch, {
    method: "POST",
    headers: bearerAuthHeaders(token),
    body: JSON.stringify(body),
  });

  const raw = await parseApiResponse<ScorpioLaunchRaw>(res);
  return mapScorpioLaunch(raw);
}
