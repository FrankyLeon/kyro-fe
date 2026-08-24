import type { User } from "@/types";
import type { PlayerBalance } from "@/types/player";
import {
  applyPlayerBalanceToUser,
  mapScorpioPlayerBalance,
  type ScorpioPlayerBalanceRaw,
} from "../adapters/scorpio";
import { getStoredSession, updateStoredUser } from "../auth";
import { resolvePlayerExternalId } from "./identity";

function getBalanceAuthHeaders(): Record<string, string> {
  const session = getStoredSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

async function parseBalanceResponse(res: Response): Promise<PlayerBalance> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Could not load balance.";
    throw new Error(message);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "balanceCents" in payload &&
    "currency" in payload
  ) {
    return payload as PlayerBalance;
  }

  return mapScorpioPlayerBalance(payload as ScorpioPlayerBalanceRaw);
}

export async function fetchPlayerBalance(): Promise<PlayerBalance> {
  const session = getStoredSession();
  if (!session?.token) {
    throw new Error("Sign in to view your balance.");
  }

  const playerExternalId = resolvePlayerExternalId();
  const params = new URLSearchParams({ playerExternalId });

  const res = await fetch(`/api/player/balance?${params}`, {
    headers: getBalanceAuthHeaders(),
    cache: "no-store",
  });

  return parseBalanceResponse(res);
}

export async function refreshUserBalance(): Promise<User> {
  const session = getStoredSession();
  if (!session?.user) {
    throw new Error("Sign in to refresh your balance.");
  }

  const balance = await fetchPlayerBalance();
  const user = applyPlayerBalanceToUser(session.user, balance);
  updateStoredUser(user);
  return user;
}
