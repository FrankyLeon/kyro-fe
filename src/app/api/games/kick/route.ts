import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { kickGame } from "@/lib/api/server/games/kick";

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to end a game session." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      playerExternalId?: string;
    };

    const playerExternalId = body.playerExternalId?.trim();
    if (!playerExternalId) {
      return NextResponse.json(
        { message: "Player identity is required." },
        { status: 400 }
      );
    }

    await kickGame(token, { playerExternalId });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not end the game session.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
