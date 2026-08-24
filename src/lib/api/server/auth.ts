import "server-only";

import type { AuthSession } from "@/types";
import { resolveAvatarUrl } from "@/lib/game-image";
import {
  mapScorpioAuth,
  type ScorpioAuthRaw,
} from "../adapters/scorpio";
import { backendFetch, parseApiResponse } from "./http";

interface BackendAuthEnvelope {
  success?: boolean;
  data?: ScorpioAuthRaw;
  message?: string;
}

export async function login(
  email: string,
  password: string
): Promise<AuthSession> {
  const res = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      username: email,
    }),
  });

  const payload = await parseApiResponse<BackendAuthEnvelope>(res);
  const raw = payload?.data ?? payload;
  return mapScorpioAuth(raw as ScorpioAuthRaw);
}

export async function register(
  email: string,
  password: string,
  displayName: string,
  avatarUrl?: string
): Promise<AuthSession> {
  const body: Record<string, string> = {
    email,
    password,
    displayName,
    avatarUrl: resolveAvatarUrl(avatarUrl, displayName),
  };

  const res = await backendFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await parseApiResponse<BackendAuthEnvelope>(res);
  const raw = payload?.data ?? payload;
  return mapScorpioAuth(raw as ScorpioAuthRaw);
}
