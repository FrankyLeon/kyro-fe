import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { fetchPlayerBalance } from "@/lib/api/server/player/balance";

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to view your balance." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const playerExternalId = searchParams.get("playerExternalId")?.trim();

    if (!playerExternalId) {
      return NextResponse.json(
        { message: "playerExternalId is required." },
        { status: 400 }
      );
    }

    const balance = await fetchPlayerBalance(token, playerExternalId);
    return NextResponse.json(balance);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load balance.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
