import { buildApiUrl } from "./config";
import { getStoredSession } from "./auth";

export function getAuthHeaders(): Record<string, string> {
  const session = getStoredSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  code?: string;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string" && record.message) {
    return record.message;
  }

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message) {
      return nested.message;
    }
  }

  return fallback;
}

function unwrapPayload<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const envelope = payload as ApiEnvelope<T>;

  if (envelope.success === false) {
    throw new ApiError(
      extractErrorMessage(payload, "Request failed"),
      400
    );
  }

  if ("data" in envelope && envelope.data !== undefined) {
    return envelope.data;
  }

  return payload as T;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      extractErrorMessage(payload, res.statusText),
      res.status
    );
  }

  return unwrapPayload<T>(payload);
}
