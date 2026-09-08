"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Game } from "@/types";
import type { Provider } from "@/types/games";
import { GameGrid } from "@/components/game/game-grid";
import { StoreHeader } from "@/components/store/store-header";
import { StoreSearch } from "@/components/store/store-search";
import { Pagination } from "@/components/ui/pagination";
import { useGameCatalog } from "@/hooks/use-game-catalog";
import {
  createGameSearchIndex,
  parseGameSort,
  type GameSort,
} from "@/lib/game-search";
import { parsePageParam } from "@/lib/pagination";
import { buildStoreUrl } from "@/lib/store-url";

interface StoreCatalogProps {
  initialGames: Game[];
  initialTotal: number;
  providers: Provider[];
  initialQuery?: string;
  initialProvider?: string;
  initialSort?: GameSort;
  initialPage: number;
}

function readStoreParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get("q") ?? "",
    provider: params.get("provider") ?? "",
    sort: parseGameSort(params.get("sort")),
    page: parsePageParam(params.get("page") ?? undefined),
  };
}

function syncStoreUrl(
  query: string,
  provider: string,
  sort: GameSort,
  page: number
) {
  const url = buildStoreUrl({
    q: query.trim() || undefined,
    provider: provider.trim() || undefined,
    sort,
    page: page > 1 ? page : undefined,
  });
  window.history.replaceState(null, "", url);
}

export function StoreCatalog({
  initialGames,
  initialTotal,
  providers,
  initialQuery = "",
  initialProvider = "",
  initialSort = "az",
  initialPage,
}: StoreCatalogProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [provider, setProvider] = useState(initialProvider);
  const [sort, setSort] = useState<GameSort>(initialSort);
  const [page, setPage] = useState(initialPage);
  const { items, total, isLoadingMore, loadMore } = useGameCatalog({
    initialItems: initialGames,
    initialTotal,
    query,
    provider,
    sort,
  });

  const fuse = useMemo(() => createGameSearchIndex(items), [items]);
  const providerNames = useMemo(() => {
    const active = providers.filter((item) => item.status === 1);
    return (active.length ? active : providers)
      .map((item) => item.providerName)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [providers]);

  useEffect(() => {
    setQuery(initialQuery);
    setProvider(initialProvider);
    setSort(initialSort);
    setPage(initialPage);
  }, [initialQuery, initialProvider, initialSort, initialPage]);

  useEffect(() => {
    syncStoreUrl(query, provider, sort, page);
  }, [query, provider, sort, page]);

  useEffect(() => {
    function onPopState() {
      const next = readStoreParams();
      setQuery(next.query);
      setProvider(next.provider);
      setSort(next.sort);
      setPage(next.page);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
  }

  function handleProviderChange(nextProvider: string) {
    setProvider(nextProvider);
    setPage(1);
  }

  function handleSortChange(nextSort: GameSort) {
    setSort(nextSort);
    setPage(1);
  }

  async function handleShowMore() {
    const loaded = await loadMore();
    if (loaded) setPage((current) => current + 1);
  }

  const hasFilters = Boolean(query.trim() || provider);

  return (
    <>
      <StoreHeader totalCount={total} searchQuery={query} />
      <StoreSearch
        query={query}
        provider={provider}
        sort={sort}
        providers={providerNames}
        fuse={fuse}
        onQueryChange={handleQueryChange}
        onProviderChange={handleProviderChange}
        onSortChange={handleSortChange}
        onSelectGame={(slug) => router.push(`/play/${slug}`)}
      />
      <div id="games" className="relative z-0 mt-8 scroll-mt-24">
        <GameGrid
          games={items}
          emptyMessage={
            hasFilters
              ? "No games matched your filters. Try another search or provider."
              : undefined
          }
        />
        <Pagination
          shown={items.length}
          total={total}
          onShowMore={() => {
            void handleShowMore();
          }}
          isLoading={isLoadingMore}
        />
      </div>
    </>
  );
}
