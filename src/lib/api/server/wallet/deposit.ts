import "server-only";

import type { CreateDepositInput, DepositResult } from "@/types/deposit";
import {
  mapScorpioDepositResult,
  type ScorpioDepositResultRaw,
} from "../../adapters/scorpio";
import { backendFetch, bearerAuthHeaders, parseApiResponse } from "../http";

export async function createDeposit(
  token: string,
  input: CreateDepositInput
): Promise<DepositResult> {
  const body = {
    userId: input.userId,
    playerExternalId: input.userId,
    amountCents: input.amountCents,
    amount_cents: input.amountCents,
    amount: input.amountCents / 100,
    coinAmount: input.amountCents,
    coin_amount: input.amountCents,
    priceCents: input.amountCents,
    price_cents: input.amountCents,
    currency: input.currency ?? "USD",
    method: input.method,
    card: input.card,
    paypal: input.paypal,
    crypto: input.crypto,
  };

  const res = await backendFetch("/wallet/deposit", {
    method: "POST",
    headers: bearerAuthHeaders(token),
    body: JSON.stringify(body),
  });

  const raw = await parseApiResponse<ScorpioDepositResultRaw>(res);
  return mapScorpioDepositResult(raw);
}
