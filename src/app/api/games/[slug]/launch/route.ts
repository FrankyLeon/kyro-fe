import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/api/server/get-bearer-token";
import { launchGame } from "@/lib/api/server/games/launch";
import { parseGameSlug } from "@/lib/api/server/games/slug";

interface LaunchRouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: LaunchRouteContext) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Sign in to launch a game." },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    if (!slug?.trim()) {
      return NextResponse.json(
        { message: "A valid game slug is required." },
        { status: 400 }
      );
    }

    const game = parseGameSlug(slug);
    if (!game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      returnUrl?: string;
      playerExternalId?: string;
      currency?: string;
      language?: string;
    };

    const playerExternalId = body.playerExternalId?.trim();
    if (!playerExternalId) {
      return NextResponse.json(
        { message: "Player identity is required to launch a game." },
        { status: 400 }
      );
    }

    const result = await launchGame(token, {
      playerExternalId,
      providerId: game.providerId,
      gameCode: game.gameCode,
      returnUrl: body.returnUrl?.trim() || undefined,
      currency: body.currency,
      language: body.language,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start the game.";
    const status = message === "Game not found." ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
