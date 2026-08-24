import type { User } from "@/types";
import { getStoredSession } from "../auth";

export function resolvePlayerExternalIdFromUser(user: User): string {
  if (user.username?.trim()) {
    return user.username.trim();
  }

  const fromEmail = user.email.split("@")[0]?.trim();
  if (fromEmail) {
    return fromEmail;
  }

  throw new Error("Player identity is missing. Sign out and sign in again.");
}

export function resolvePlayerExternalId(): string {
  const session = getStoredSession();
  const user = session?.user;
  if (!user) {
    throw new Error("Sign in to continue.");
  }

  return resolvePlayerExternalIdFromUser(user);
}
