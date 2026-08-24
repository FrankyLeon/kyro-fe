import { NextResponse } from "next/server";
import type { CreateDepositInput } from "@/types/deposit";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { createDeposit } from "@/lib/api/server/wallet/deposit";
import { getWalletMinAmountCents } from "@/lib/wallet-config";

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to make a deposit." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateDepositInput;

    const minAmountCents = getWalletMinAmountCents();

    if (!body.amountCents || body.amountCents < minAmountCents) {
      return NextResponse.json(
        { message: `Minimum deposit is ${minAmountCents / 100} USD.` },
        { status: 400 }
      );
    }

    if (!body.method) {
      return NextResponse.json(
        { message: "A payment method is required." },
        { status: 400 }
      );
    }

    const result = await createDeposit(token, body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Deposit failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
