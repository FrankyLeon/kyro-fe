export const DEFAULT_CURRENCY = "USD";

export function parseCustomDepositCents(input: string): number {
  const normalized = input.replace(/[^0-9.]/g, "");
  const dollars = parseFloat(normalized);
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  return Math.round(dollars * 100);
}
