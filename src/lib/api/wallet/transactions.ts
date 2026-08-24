import type { TransactionRecord } from "@/types/wallet";
import { mapScorpioTransactionHistory } from "../adapters/scorpio";
import { getWalletAuthHeaders, requireSessionToken } from "./client";

async function parseTransactionHistoryResponse(
  res: Response
): Promise<TransactionRecord[]> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Could not load transaction history.";
    throw new Error(message);
  }

  return mapScorpioTransactionHistory(payload);
}

export async function fetchTransactionHistory(): Promise<TransactionRecord[]> {
  requireSessionToken();

  const res = await fetch("/api/wallet/transactions", {
    headers: getWalletAuthHeaders(),
    cache: "no-store",
  });

  return parseTransactionHistoryResponse(res);
}
