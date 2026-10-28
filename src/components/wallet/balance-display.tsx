"use client";

import type { User } from "@/types";
import type { PlayerBalanceEntry } from "@/types/player";
import { useI18n } from "@/context/locale-context";
import { formatBalance } from "@/lib/utils";

interface BalanceDisplayProps {
  user: User;
  size?: "md" | "lg";
}

function formatEntryAmount(entry: PlayerBalanceEntry, locale: string): string {
  return formatBalance(Math.round(entry.amount * 100), entry.currency, locale);
}

export function BalanceDisplay({ user, size = "md" }: BalanceDisplayProps) {
  const { t, intl } = useI18n();
  const entries =
    user.balances && user.balances.length > 0
      ? user.balances
      : [{ currency: user.currency, amount: user.balanceCents / 100 }];

  const primaryClass =
    size === "lg" ? "text-4xl sm:text-5xl font-bold" : "text-2xl font-bold";

  return (
    <div className="space-y-3">
      <div>
        <p
          className={`${primaryClass} text-amber-300`}
        >
          {formatBalance(user.balanceCents, user.currency, intl)}
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          {t("account.primaryBalance", { currency: user.currency })}
        </p>
      </div>

      {entries.length > 1 ? (
        <ul className="space-y-2 border-t border-zinc-800/80 pt-3">
          {entries.map((entry) => (
            <li
              key={entry.currency}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-500">{entry.currency}</span>
              <span className="font-medium text-zinc-200">
                {formatEntryAmount(entry, intl)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
