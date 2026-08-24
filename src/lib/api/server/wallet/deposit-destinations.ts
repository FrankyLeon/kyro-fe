import "server-only";

import type { DepositDestinations } from "@/types/deposit";
import { normalizeDepositDestinations } from "@/lib/payment-methods";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function fetchDepositDestinations(
  token: string
): Promise<DepositDestinations> {
  const { endpoints } = getApiConfig();

  const res = await backendFetch(endpoints.walletDepositDestinations, {
    method: "GET",
    headers: bearerAuthHeaders(token),
  });

  const raw = await parseApiResponse<DepositDestinations>(res);
  return normalizeDepositDestinations(raw);
}
