import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { fetchWithdrawDestinations } from "@/lib/api/server/wallet/withdraw-destinations";

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to view withdrawal methods." },
        { status: 401 }
      );
    }

    const destinations = await fetchWithdrawDestinations(token);
    return NextResponse.json(destinations);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load withdrawal methods.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
