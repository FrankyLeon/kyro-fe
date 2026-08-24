import { getStoredSession } from "../auth";

export function getWalletAuthHeaders(): Record<string, string> {
  const session = getStoredSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

export function requireSessionToken(): string {
  const session = getStoredSession();
  if (!session?.token) {
    throw new Error("Sign in to access your wallet.");
  }
  return session.token;
}

export async function parseWalletError(
  res: Response,
  fallback: string
): Promise<never> {
  const payload = await res.json().catch(() => null);
  const message =
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
      ? (payload as { message: string }).message
      : fallback;
  throw new Error(message);
}
