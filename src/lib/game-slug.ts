export interface ParsedGameSlug {
  providerId: number;
  gameCode: string;
}

/**
 * Launch code from platform `gameID` values like `16_619` or `1_vs20wildparty`.
 * The prefix is the provider id; Scorpio expects the remainder as `gameCode`.
 */
export function launchGameCodeFromId(
  gameId: string,
  providerId: string | number
): string {
  const id = gameId.trim();
  if (!id) return "";

  const prefix = `${providerId}_`;
  if (id.length > prefix.length && id.startsWith(prefix)) {
    return id.slice(prefix.length);
  }

  const separator = id.indexOf("_");
  if (separator > 0) {
    return id.slice(separator + 1);
  }

  return id;
}

export function buildGameSlug(
  providerId: string | number,
  gameCode: string
): string {
  return `${providerId}-${encodeURIComponent(gameCode)}`;
}

/** Drop a duplicated `{providerId}-` / `{providerId}_` prefix from older slugs. */
function stripDuplicateProviderPrefix(
  providerId: number,
  gameCode: string
): string {
  for (const separator of ["-", "_"] as const) {
    const prefix = `${providerId}${separator}`;
    if (gameCode.startsWith(prefix) && gameCode.length > prefix.length) {
      return gameCode.slice(prefix.length);
    }
  }
  return gameCode;
}

/** Slug format: `{providerId}-{gameCode}` (e.g. `1-vswaysdogs`, `16-619`). */
export function parseGameSlug(slug: string): ParsedGameSlug | null {
  const normalized = slug.trim();
  if (!normalized) return null;

  const dashIndex = normalized.indexOf("-");
  if (dashIndex <= 0) return null;

  const providerId = Number(normalized.slice(0, dashIndex));
  let gameCode = normalized.slice(dashIndex + 1);
  try {
    gameCode = decodeURIComponent(gameCode);
  } catch {
    return null;
  }

  if (!Number.isInteger(providerId) || providerId < 1 || !gameCode) {
    return null;
  }

  gameCode = stripDuplicateProviderPrefix(providerId, gameCode);
  if (!gameCode) return null;

  return { providerId, gameCode };
}
