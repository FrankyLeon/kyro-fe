export interface ParsedGameSlug {
  providerId: number;
  gameCode: string;
}

/** Slug format: `{providerId}-{gameCode}` (e.g. `1-vswaysdogs`). */
export function parseGameSlug(slug: string): ParsedGameSlug | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const dashIndex = normalized.indexOf("-");
  if (dashIndex <= 0) return null;

  const providerId = Number(normalized.slice(0, dashIndex));
  const gameCode = normalized.slice(dashIndex + 1);

  if (!Number.isInteger(providerId) || providerId < 1 || !gameCode) {
    return null;
  }

  return { providerId, gameCode };
}
