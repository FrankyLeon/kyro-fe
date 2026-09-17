const TX_HASH_RE = /^0x[0-9a-f]{64}$/;

/** Normalize a BSC tx hash to `0x` + 64 hex chars, or `""` if invalid. */
export function normalizeBep20TxHash(value: string): string {
  const hash = value.trim().toLowerCase();
  if (!hash) return "";
  const withPrefix = hash.startsWith("0x") ? hash : `0x${hash}`;
  return TX_HASH_RE.test(withPrefix) ? withPrefix : "";
}

export function shortenTxHash(hash: string, lead = 10, tail = 8): string {
  const normalized = hash.trim();
  if (normalized.length <= lead + tail + 1) return normalized;
  return `${normalized.slice(0, lead)}…${normalized.slice(-tail)}`;
}

export function bep20ExplorerTxUrl(txHash: string): string {
  return `https://bscscan.com/tx/${txHash}`;
}
