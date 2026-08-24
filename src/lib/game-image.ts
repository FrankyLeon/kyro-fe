const GAME_PLACEHOLDER_BASE =
  "https://api.dicebear.com/9.x/shapes/svg?backgroundColor=18181b,f59e0b,27272a";

const AVATAR_PLACEHOLDER_BASE =
  "https://api.dicebear.com/9.x/lorelei/svg?backgroundColor=18181b,f59e0b,27272a";

function isEmptyImageUrl(url: string | undefined): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return lower === "null" || lower === "undefined";
}

export function resolveGameImage(
  url: string | undefined,
  seed: string
): string {
  if (!isEmptyImageUrl(url)) return url!.trim();
  return `${GAME_PLACEHOLDER_BASE}&seed=${encodeURIComponent(seed)}`;
}

export function resolveAvatarUrl(
  url: string | undefined,
  seed: string
): string {
  if (!isEmptyImageUrl(url)) return url!.trim();
  const safeSeed = seed.trim() || "player";
  return `${AVATAR_PLACEHOLDER_BASE}&seed=${encodeURIComponent(safeSeed)}`;
}
