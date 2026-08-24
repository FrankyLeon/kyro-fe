"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPaginationRange,
  type PaginationMeta,
} from "@/lib/pagination";
import { buildStoreUrl } from "@/lib/store-url";

interface PaginationProps {
  meta: PaginationMeta;
  search?: string;
  className?: string;
  onPageChange?: (page: number) => void;
}

function pageClass(active: boolean, disabled = false) {
  return cn(
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
    active
      ? "bg-amber-500 text-zinc-950"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
    disabled && "pointer-events-none opacity-40"
  );
}

export function Pagination({
  meta,
  search,
  className,
  onPageChange,
}: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const pages = getPaginationRange(meta.page, meta.totalPages);
  const query = { q: search };
  const linkOptions = { hash: true } as const;
  const clientMode = Boolean(onPageChange);

  function goToPage(page: number) {
    const target = Math.min(Math.max(1, page), meta.totalPages);
    if (target !== meta.page) onPageChange?.(target);
  }

  function hrefFor(page: number) {
    return buildStoreUrl({ ...query, page }, linkOptions);
  }

  function PageButton({
    page,
    active,
    children,
  }: {
    page: number;
    active?: boolean;
    children: ReactNode;
  }) {
    if (clientMode) {
      return (
        <button
          type="button"
          onClick={() => goToPage(page)}
          className={pageClass(Boolean(active))}
          aria-label={`Page ${page}`}
          aria-current={active ? "page" : undefined}
        >
          {children}
        </button>
      );
    }

    return (
      <Link
        href={hrefFor(page)}
        className={pageClass(Boolean(active))}
        aria-label={`Page ${page}`}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </Link>
    );
  }

  function NavButton({
    page,
    disabled,
    label,
    children,
  }: {
    page: number;
    disabled: boolean;
    label: string;
    children: ReactNode;
  }) {
    if (clientMode) {
      return (
        <button
          type="button"
          onClick={() => goToPage(page)}
          disabled={disabled}
          className={cn(pageClass(false, disabled), "gap-1 px-2.5")}
          aria-label={label}
        >
          {children}
        </button>
      );
    }

    if (disabled) {
      return (
        <span
          className={cn(pageClass(false, true), "gap-1 px-2.5")}
          aria-disabled
        >
          {children}
        </span>
      );
    }

    return (
      <Link
        href={hrefFor(page)}
        className={cn(pageClass(false), "gap-1 px-2.5")}
        aria-label={label}
      >
        {children}
      </Link>
    );
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center gap-4 border-t border-zinc-800/80 pt-8",
        className
      )}
    >
      <p className="text-sm text-zinc-500">
        {meta.start}–{meta.end} of {meta.total.toLocaleString()} games
      </p>

      <div className="flex items-center gap-1">
        <NavButton
          page={meta.page - 1}
          disabled={!meta.hasPrevious}
          label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </NavButton>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-600"
            >
              …
            </span>
          ) : (
            <PageButton key={item} page={item} active={item === meta.page}>
              {item}
            </PageButton>
          )
        )}

        <NavButton
          page={meta.page + 1}
          disabled={!meta.hasNext}
          label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </NavButton>
      </div>
    </nav>
  );
}
