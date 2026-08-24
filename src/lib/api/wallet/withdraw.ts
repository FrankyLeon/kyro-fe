import type { User } from "@/types";
import type { CreateWithdrawInput, WalletTransferResult } from "@/types/wallet";
import { mapScorpioWalletTransfer, type ScorpioWalletTransferRaw } from "../adapters/scorpio";
import { refreshUserBalance } from "../player";
import {
  getWalletAuthHeaders,
  parseWalletError,
  requireSessionToken,
} from "./client";

async function parseWithdrawResponse(
  res: Response
): Promise<WalletTransferResult> {
  if (!res.ok) {
    await parseWalletError(res, "Withdrawal failed.");
  }

  const payload = await res.json().catch(() => null);
  return mapScorpioWalletTransfer(payload as ScorpioWalletTransferRaw, "withdraw");
}

export async function createWithdraw(
  user: User,
  input: Omit<CreateWithdrawInput, "userId">
): Promise<WalletTransferResult> {
  requireSessionToken();

  const res = await fetch("/api/wallet/withdraw", {
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

  const result = await parseWithdrawResponse(res);
  await refreshUserBalance().catch(() => {
    // Withdraw succeeded; balance sync can retry from the UI.
  });
  return result;
}
