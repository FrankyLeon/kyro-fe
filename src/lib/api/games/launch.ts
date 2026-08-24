import type { GameLaunchResult } from "@/types/games";
import {
  getGameAuthHeaders,
  requireSessionToken,
  resolvePlayerExternalId,
} from "./client";

async function parseLaunchResponse(res: Response): Promise<GameLaunchResult> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Could not start the game.";
    throw new Error(message);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "gameUrl" in payload &&
    typeof (payload as GameLaunchResult).gameUrl === "string"
  ) {
    return payload as GameLaunchResult;
  }

  throw new Error("Launch response did not include a game URL.");
}

export async function launchGame(
  slug: string,
  returnUrl?: string
): Promise<GameLaunchResult> {
  requireSessionToken();

  const res = await fetch(`/api/games/${encodeURIComponent(slug)}/launch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getGameAuthHeaders(),
    },
    body: JSON.stringify({
      returnUrl,
      playerExternalId: resolvePlayerExternalId(),
    }),
  });

  return parseLaunchResponse(res);
}

export type { GameLaunchResult };
