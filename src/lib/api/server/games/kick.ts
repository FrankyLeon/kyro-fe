import "server-only";

import type { GameKickInput } from "@/types/games";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function kickGame(
  token: string,
  input: GameKickInput
): Promise<void> {
  const { endpoints } = getApiConfig();

  const res = await backendFetch(endpoints.gameKick, {
    method: "POST",
    headers: bearerAuthHeaders(token),
    body: JSON.stringify({
      playerExternalId: input.playerExternalId,
    }),
  });

  await parseApiResponse<Record<string, never>>(res);
}
