import "server-only";

import type { TransactionRecord } from "@/types/wallet";
import {
  mapScorpioTransactionHistory,
  type ScorpioTransactionRecordRaw,
} from "../../adapters/scorpio";
import { getApiConfig } from "../../config";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function fetchTransactions(
  token: string
): Promise<TransactionRecord[]> {
  const { endpoints } = getApiConfig();

  const res = await backendFetch(endpoints.walletTransactions, {
    method: "GET",
    headers: bearerAuthHeaders(token),
  });

  const raw = await parseApiResponse<
    ScorpioTransactionRecordRaw[] | Record<string, unknown>
  >(res);

  return mapScorpioTransactionHistory(raw);
}
