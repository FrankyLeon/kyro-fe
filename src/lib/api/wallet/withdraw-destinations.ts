import type { WithdrawDestinations } from "@/types/wallet";
import {
  FALLBACK_WITHDRAW_DESTINATIONS,
  normalizeWithdrawDestinations,
} from "@/lib/payment-methods";
import { getWalletAuthHeaders, requireSessionToken } from "./client";

export async function fetchWithdrawDestinations(): Promise<WithdrawDestinations> {
  requireSessionToken();

  const res = await fetch("/api/wallet/withdraw-destinations", {
    headers: getWalletAuthHeaders(),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Could not load withdrawal methods.";
    throw new Error(message);
  }

  return normalizeWithdrawDestinations(payload as WithdrawDestinations);
}

export { FALLBACK_WITHDRAW_DESTINATIONS };
