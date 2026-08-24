import { NextResponse } from "next/server";
import { resolveAvatarUrl } from "@/lib/game-image";
import { register } from "@/lib/api/server/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      displayName?: string;
      avatarUrl?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const displayName = body.displayName?.trim() ?? "";
    const avatarUrl = body.avatarUrl?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const resolvedName = displayName || email.split("@")[0] || "Player";
    const session = await register(
      email,
      password,
      resolvedName,
      resolveAvatarUrl(avatarUrl, resolvedName)
    );
    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
