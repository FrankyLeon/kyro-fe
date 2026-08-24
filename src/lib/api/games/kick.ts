import {
  getGameAuthHeaders,
  parseGameApiError,
  requireSessionToken,
  resolvePlayerExternalId,
} from "./client";

export async function kickGame(): Promise<void> {
  requireSessionToken();

  const res = await fetch("/api/games/kick", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getGameAuthHeaders(),
    },
    body: JSON.stringify({
      playerExternalId: resolvePlayerExternalId(),
    }),
  });

  if (!res.ok) {
    await parseGameApiError(res, "Could not end the game session.");
  }
}
