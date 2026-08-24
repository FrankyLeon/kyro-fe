/** Minimum deposit/withdraw amount in dollars (default: $1). */
const DEFAULT_MIN_AMOUNT_DOLLARS = 1;

function parseWalletMinAmountDollars(): number {
  const raw = process.env.NEXT_PUBLIC_WALLET_MIN_AMOUNT?.trim();
  if (!raw) return DEFAULT_MIN_AMOUNT_DOLLARS;

  const value = parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_MIN_AMOUNT_DOLLARS;
  }

  return value;
}

export function getWalletMinAmountDollars(): number {
  return parseWalletMinAmountDollars();
}

export function getWalletMinAmountCents(): number {
  return Math.round(parseWalletMinAmountDollars() * 100);
}

/** Minimum balance required before launching a game (same as min deposit). */
export function getMinBalanceToPlayCents(): number {
  return getWalletMinAmountCents();
}
