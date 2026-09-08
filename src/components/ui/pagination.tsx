"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  shown: number;
  total: number;
  onShowMore: () => void;
  isLoading?: boolean;
  className?: string;
}

export function Pagination({
  shown,
  total,
  onShowMore,
  isLoading = false,
  className,
}: PaginationProps) {
  if (total === 0) return null;

  const progress = Math.min(100, (shown / total) * 100);
  const hasMore = shown < total;

  return (
    <div className={cn("flex flex-col items-center gap-3 pt-8", className)}>
      <div
        className="h-1 w-36 overflow-hidden rounded-full bg-zinc-800 sm:w-44"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={shown}
        aria-label="Games loaded"
      >
        <div
          className="h-full rounded-full bg-amber-400 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-white">
        Showing {shown.toLocaleString()} of {total.toLocaleString()}
      </p>

      {hasMore ? (
        <button
          type="button"
          onClick={onShowMore}
          disabled={isLoading}
          className="relative overflow-hidden rounded-lg border border-amber-400 bg-zinc-950 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-400/10 disabled:cursor-wait disabled:opacity-80"
        >
          {isLoading ? (
            <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-zinc-800">
              <span className="catalog-load-bar block h-full w-1/3 rounded-full bg-amber-400" />
            </span>
          ) : null}
          {isLoading ? "Loading..." : "Show More"}
        </button>
      ) : null}
    </div>
  );
}
