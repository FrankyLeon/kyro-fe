import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { fetchTransactions } from "@/lib/api/server/wallet/transactions";

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to view transaction history." },
        { status: 401 }
      );
    }

    const transactions = await fetchTransactions(token);
    return NextResponse.json(transactions);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load transactions.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
