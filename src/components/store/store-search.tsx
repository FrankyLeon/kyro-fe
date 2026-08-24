"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import type { Game } from "@/types";
import { resolveGameImage } from "@/lib/game-image";
import { getSearchSuggestions, splitHighlight } from "@/lib/game-search";
import { formatProviderLabel } from "@/lib/site-copy";
import type Fuse from "fuse.js";
import { cn } from "@/lib/utils";

interface StoreSearchProps {
  query: string;
  resultCount: number;
  fuse: Fuse<Game>;
  onQueryChange: (query: string) => void;
  onSelectGame?: (slug: string) => void;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = splitHighlight(text, query);

  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark
            key={`${segment.text}-${index}`}
            className="rounded bg-amber-500/25 text-amber-200 not-italic"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        )
      )}
    </>
  );
}

export function StoreSearch({
  query,
  resultCount,
  fuse,
  onQueryChange,
  onSelectGame,
}: StoreSearchProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = open ? getSearchSuggestions(fuse, query, 6) : [];

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, open]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleClear() {
    onQueryChange("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function selectSuggestion(game: Game) {
    onSelectGame?.(game.slug);
    onQueryChange(game.title);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative rounded-2xl glass-card p-4 shadow-xl shadow-black/30"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Search games
          </div>
          {query ? (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
              {resultCount.toLocaleString()} result
              {resultCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="relative z-10">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search games by title or provider…"
            className={cn(
              "h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/80",
              "pl-11 pr-11 text-sm text-zinc-100 placeholder:text-zinc-500",
              "outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {open && suggestions.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40"
            >
            {suggestions.map((game, index) => (
              <li key={game.id} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectSuggestion(game)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    index === activeIndex
                      ? "bg-amber-500/10 text-amber-50"
                      : "text-zinc-200 hover:bg-zinc-900"
                  )}
                >
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    <Image
                      src={resolveGameImage(game.coverImage, game.slug)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      <HighlightedText text={game.title} query={query} />
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {formatProviderLabel(game)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
              <li className="border-t border-zinc-800 px-3 py-2 text-center text-xs text-zinc-500">
                ↑↓ navigate · Enter to open · Esc to close
              </li>
            </ul>
          ) : null}
        </div>
      </div>

      {query ? (
        <p className="text-sm text-zinc-500">
          Showing results for{" "}
          <span className="font-medium text-amber-400/90">
            &ldquo;{query}&rdquo;
          </span>
        </p>
      ) : null}
    </div>
  );
}
