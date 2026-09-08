"use client";

import { useAuth } from "@/context/auth-context";

interface StoreHeaderProps {
  totalCount: number;
  searchQuery?: string;
}

export function StoreHeader({ totalCount, searchQuery }: StoreHeaderProps) {
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
    </div>
  );
}
