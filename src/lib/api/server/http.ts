import "server-only";

import { getApiConfig } from "../config";

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export function getApiBaseUrl(): string {
  const { baseUrl, prefix } = getApiConfig();

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Set it to your backend API URL."
    );
  }

  return `${baseUrl}${prefix}`;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message) {
    return record.message;
  }

  return fallback;
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
  const raw = await res.text();
  let payload: unknown = null;
  
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      if (!res.ok) {
        throw new Error(
          res.status === 500
            ? "Backend API is unavailable."
            : "Unexpected response from backend API."
        );
      }
    }
  }

  if (!res.ok) {
    throw new Error(
      extractErrorMessage(payload, res.statusText || "Request failed")
    );
  }

  if (payload && typeof payload === "object") {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.message ?? "Request failed");
    }
    if ("data" in envelope && envelope.data !== undefined) {
      return envelope.data;
    }
  }

  return payload as T;
}

export function bearerAuthHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function backendFetch(
  path: string,
  init: RequestInit
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  return fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...init,
    cache: "no-store",
  });
}
