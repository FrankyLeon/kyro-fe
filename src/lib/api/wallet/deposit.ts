import type { User } from "@/types";
import type {
  CreateDepositInput,
  DepositRecord,
  DepositResult,
} from "@/types/deposit";
import {
  mapScorpioDepositRecord,
  mapScorpioDepositResult,
  mapScorpioUser,
  type ScorpioDepositRecordRaw,
  type ScorpioDepositResultRaw,
  type ScorpioUserRaw,
} from "../adapters/scorpio";
import { refreshUserBalance } from "../player";
import { getWalletAuthHeaders, requireSessionToken } from "./client";

async function parseDepositResponse(res: Response): Promise<DepositResult> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Deposit failed.";
    throw new Error(message);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "user" in payload &&
    "transaction" in payload
  ) {
    const result = payload as {
      user: ScorpioUserRaw;
      transaction: ScorpioDepositRecordRaw;
    };
    return {
      user: mapScorpioUser(result.user),
      transaction: mapScorpioDepositRecord(result.transaction),
    };
  }

  return mapScorpioDepositResult(payload as ScorpioDepositResultRaw);
}

export async function createDeposit(
  user: User,
  input: CreateDepositInput
): Promise<DepositResult> {
  requireSessionToken();

  const res = await fetch("/api/wallet/deposit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getWalletAuthHeaders(),
    },
    body: JSON.stringify({
      ...input,
      userId: user.id,
    }),
  });

  const result = await parseDepositResponse(res);
  await refreshUserBalance().catch(() => {
    // Deposit succeeded; balance sync can retry from the UI.
  });
  return result;
}
