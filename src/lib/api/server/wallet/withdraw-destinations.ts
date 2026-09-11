import "server-only";

import type { WithdrawDestinations } from "@/types/wallet";
import { normalizeWithdrawDestinations } from "@/lib/payment-methods";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function fetchWithdrawDestinations(
  token: string
): Promise<WithdrawDestinations> {
  const { endpoints } = getApiConfig();

  const res = await backendFetch(endpoints.walletWithdrawDestinations, {
    method: "GET",
    headers: bearerAuthHeaders(token),
  });

  const raw = await parseApiResponse<WithdrawDestinations>(res);
  return normalizeWithdrawDestinations(raw);
}
