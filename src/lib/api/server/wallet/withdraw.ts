import "server-only";

import type { CreateWithdrawInput, WalletTransferResult } from "@/types/wallet";
import {
  mapScorpioWalletTransfer,
  type ScorpioWalletTransferRaw,
} from "../../adapters/scorpio";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function createWithdraw(
  token: string,
  input: CreateWithdrawInput
): Promise<WalletTransferResult> {
  const currency = input.currency ?? "USD";

  const res = await backendFetch("/wallet/withdraw", {
    method: "POST",
    headers: bearerAuthHeaders(token),
    body: JSON.stringify({
      userId: input.userId,
      playerExternalId: input.userId,
      currency,
      amount: input.amount,
    }),
  });

  const raw = await parseApiResponse<ScorpioWalletTransferRaw>(res);
  return mapScorpioWalletTransfer(raw, "withdraw");
}
