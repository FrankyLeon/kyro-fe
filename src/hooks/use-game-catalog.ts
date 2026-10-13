"use client";

import { useEffect, useRef, useState } from "react";
import type { Game } from "@/types";
import { fetchGameCatalog } from "@/lib/api/games/catalog";
import type { GameSort } from "@/lib/game-search";
import { STORE_INITIAL_SIZE, STORE_MORE_SIZE } from "@/lib/pagination";

interface UseGameCatalogOptions {
  initialItems: Game[];
  initialTotal: number;
  query: string;
  provider: string;
  sort: GameSort;
}

export function useGameCatalog({
  initialItems,
  initialTotal,
  query,
  provider,
  sort,
}: UseGameCatalogOptions) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestId = useRef(0);
  const filterKey = `${query}\0${provider}\0${sort}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  const [catalogSource, setCatalogSource] = useState({
    initialItems,
    initialTotal,
  });

  if (
    catalogSource.initialItems !== initialItems ||
    catalogSource.initialTotal !== initialTotal
  ) {
    setCatalogSource({ initialItems, initialTotal });
    setItems(initialItems);
    setTotal(initialTotal);
    if (appliedFilterKey !== filterKey) {
      setAppliedFilterKey(filterKey);
    }
  }

  useEffect(() => {
    if (appliedFilterKey === filterKey) return;

    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const page = await fetchGameCatalog({
          q: query,
          provider,
          sort,
          offset: 0,
          limit: STORE_INITIAL_SIZE,
        });
        if (currentRequest !== requestId.current) return;
        setItems(page.items);
        setTotal(page.total);
        setAppliedFilterKey(filterKey);
      } catch {
        if (currentRequest !== requestId.current) return;
      }
    }, query.trim() ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [appliedFilterKey, filterKey, provider, query, sort]);

  async function loadMore() {
    if (isLoadingMore || items.length >= total) return false;

    const currentRequest = ++requestId.current;
    setIsLoadingMore(true);

    try {
      const page = await fetchGameCatalog({
        q: query,
        provider,
        sort,
        offset: items.length,
        limit: STORE_MORE_SIZE,
      });
      if (currentRequest !== requestId.current) return false;

      setItems((current) => {
        const seen = new Set(current.map((game) => game.id));
        return [
          ...current,
          ...page.items.filter((game) => !seen.has(game.id)),
        ];
      });
      setTotal(page.total);
      return true;
    } catch {
      return false;
    } finally {
      if (currentRequest === requestId.current) {
        setIsLoadingMore(false);
      }
    }
  }

  return { items, total, isLoadingMore, loadMore };
}
