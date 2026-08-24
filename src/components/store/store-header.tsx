"use client";

import { useAuth } from "@/context/auth-context";

interface StoreHeaderProps {
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  page: number;
  totalPages: number;
  searchQuery?: string;
}

export function StoreHeader({
  totalCount,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  searchQuery,
}: StoreHeaderProps) {
  const { user, isLoading } = useAuth();

  const actionHint =
    !isLoading && user
      ? "Deposit funds and play instantly"
      : "Sign in and deposit to start betting";

  const rangeLabel =
    totalCount === 0
      ? searchQuery
        ? `No games match "${searchQuery}"`
        : "No games found"
      : totalPages > 1
        ? `Showing ${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${totalCount.toLocaleString()} games`
        : `${totalCount.toLocaleString()} games`;

  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
        Games
      </h1>
      <p className="text-zinc-500 mt-2">
        {rangeLabel}
        {totalCount > 0 ? (
          <span className="text-zinc-600"> · {actionHint}</span>
        ) : null}
      </p>
      {totalPages > 1 ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-amber-500/80">
          Page {page} of {totalPages}
        </p>
      ) : null}
    </div>
  );
}
