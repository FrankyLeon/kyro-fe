"use client";

import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/locale-context";

interface StoreHeaderProps {
  totalCount: number;
  searchQuery?: string;
}

export function StoreHeader({ totalCount, searchQuery }: StoreHeaderProps) {
  const { t, intl } = useI18n();
  const { user, isLoading } = useAuth();

  const actionHint =
    !isLoading && user ? t("store.signedInHint") : t("store.guestHint");

  const rangeLabel =
    totalCount === 0
      ? searchQuery
        ? t("store.noMatch", { query: searchQuery })
        : t("store.none")
      : t("store.count", { count: totalCount.toLocaleString(intl) });

  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {t("store.title")}
      </h1>
      <p className="text-zinc-500 mt-2">
        {rangeLabel}
        {totalCount > 0 ? (
          <span className="text-zinc-600"> · {actionHint}</span>
        ) : null}
      </p>
    </div>
  );
}
