import { NextResponse } from "next/server";
import type { CreateWithdrawInput } from "@/types/wallet";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { createWithdraw } from "@/lib/api/server/wallet/withdraw";
import { getWalletMinAmountDollars } from "@/lib/wallet-config";

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to make a withdrawal." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateWithdrawInput;

    const minAmount = getWalletMinAmountDollars();

    if (!body.amount || body.amount < minAmount) {
      return NextResponse.json(
        { message: `Minimum withdrawal is $${minAmount}.` },
        { status: 400 }
      );
    }

    const result = await createWithdraw(token, body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Withdrawal failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
