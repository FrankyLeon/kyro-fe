import type { AuthSession, User } from "@/types";
import { resolveAvatarUrl } from "@/lib/game-image";
import {
  mapScorpioAuth,
  mapScorpioUser,
  type ScorpioAuthRaw,
  type ScorpioUserRaw,
} from "./adapters/scorpio";

const SESSION_KEY = "scorpio_session";

function normalizeStoredUser(user: User & { coinBalance?: number }): User {
  if (typeof user.balanceCents === "number") {
    return {
      ...user,
      currency: user.currency ?? "USD",
    };
  }

  return {
    ...user,
    balanceCents: Math.round((user.coinBalance ?? 0) * 100),
    currency: user.currency ?? "USD",
  };
}

async function parseAuthResponse(res: Response): Promise<AuthSession> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Authentication failed.";
    throw new Error(message);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data &&
    typeof (payload as { data?: unknown }).data === "object"
  ) {
    const nested = (payload as { data: unknown }).data as Record<string, unknown>;
    if ("user" in nested && "token" in nested) {
      const session = nested as { user: ScorpioUserRaw; token: string };
      return {
        user: mapScorpioUser(session.user),
        token: session.token,
      };
    }
  }

  if (
    payload &&
    typeof payload === "object" &&
    "user" in payload &&
    "token" in payload
  ) {
    const session = payload as { user: ScorpioUserRaw; token: string };
    return {
      user: mapScorpioUser(session.user),
      token: session.token,
    };
  }

  return mapScorpioAuth(payload as ScorpioAuthRaw);
}

export async function login(
  email: string,
  password: string
): Promise<AuthSession> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const session = await parseAuthResponse(res);

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export async function register(
  email: string,
  password: string,
  displayName: string,
  avatarUrl?: string
): Promise<AuthSession> {
  const payload: Record<string, string> = {
    email,
    password,
    displayName,
    avatarUrl: resolveAvatarUrl(avatarUrl, displayName),
  };

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const session = await parseAuthResponse(res);

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return {
      ...session,
      user: normalizeStoredUser(session.user as User & { coinBalance?: number }),
    };
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function updateStoredUser(user: AuthSession["user"]): void {
  const session = getStoredSession();
  if (session && typeof window !== "undefined") {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...session, user })
    );
  }
}
