export function parseWithdrawAmount(input: string): number {
  const normalized = input.replace(/[^0-9.]/g, "");
  const dollars = parseFloat(normalized);
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  return dollars;
}

export function parseWithdrawCents(input: string): number {
  return Math.round(parseWithdrawAmount(input) * 100);
}
