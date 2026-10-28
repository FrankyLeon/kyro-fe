import type { TFunction } from "@/i18n/translate";

const BANK_IDS = ["khan", "golomt", "tdb", "xac", "state"] as const;

type BankId = (typeof BANK_IDS)[number];

const BANK_BY_NAME: Record<string, BankId> = {
  "Khan Bank": "khan",
  "Golomt Bank": "golomt",
  "Trade and Development Bank": "tdb",
  XacBank: "xac",
  "State Bank": "state",
};

function isBankId(value: string): value is BankId {
  return (BANK_IDS as readonly string[]).includes(value);
}

export function bankDisplayName(
  t: TFunction,
  id: string | undefined,
  label: string
): string {
  if (id && isBankId(id)) return t(`banks.${id}`);
  const mapped = BANK_BY_NAME[label];
  if (mapped) return t(`banks.${mapped}`);
  return label;
}

export function paymentMethodLabel(
  t: TFunction,
  id: string,
  fallback: string
): string {
  if (id === "bank" || id === "crypto" || id === "card" || id === "paypal") {
    return t(`wallet.methods.${id}`);
  }
  return fallback;
}

export function translateInstruction(t: TFunction, line: string): string {
  if (line === "Deposit only from one account registered to this player.") {
    return t("wallet.instructions.oneAccount");
  }
  if (
    line ===
    "Transfers from a different account will not be eligible for withdrawal."
  ) {
    return t("wallet.instructions.otherAccount");
  }
  if (
    line === "Include your player name (username) in the transfer description."
  ) {
    return t("wallet.instructions.includeName");
  }
  return line;
}

export function txStatusLabel(t: TFunction, status: string): string {
  if (
    status === "pending" ||
    status === "completed" ||
    status === "rejected" ||
    status === "failed"
  ) {
    return t(`tx.${status}`);
  }
  return status;
}
