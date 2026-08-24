import type { DepositDestinations } from "@/types/deposit";
import {
  FALLBACK_DEPOSIT_DESTINATIONS,
  normalizeDepositDestinations,
} from "@/lib/payment-methods";
import { getWalletAuthHeaders, requireSessionToken } from "./client";

export async function fetchDepositDestinations(): Promise<DepositDestinations> {
  requireSessionToken();

  const res = await fetch("/api/wallet/deposit-destinations", {
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
        : "Could not load deposit destinations.";
    throw new Error(message);
  }

  return normalizeDepositDestinations(payload as DepositDestinations);
}

export { FALLBACK_DEPOSIT_DESTINATIONS };
