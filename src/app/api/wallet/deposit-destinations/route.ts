import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { fetchDepositDestinations } from "@/lib/api/server/wallet/deposit-destinations";

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to view deposit destinations." },
        { status: 401 }
      );
    }

    const destinations = await fetchDepositDestinations(token);
    return NextResponse.json(destinations);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load deposit destinations.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
