"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Game } from "@/types";
import type { Provider } from "@/types/games";
import { GameGrid } from "@/components/game/game-grid";
import { StoreSearch } from "@/components/store/store-search";
import { Pagination } from "@/components/ui/pagination";
import { useGameCatalog } from "@/hooks/use-game-catalog";
import { createGameSearchIndex, type GameSort } from "@/lib/game-search";

interface PopularGamesProps {
  initialGames: Game[];
  initialTotal: number;
  providers: Provider[];
}

export function PopularGames({
  initialGames,
  initialTotal,
  providers,
}: PopularGamesProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("");
  const [sort, setSort] = useState<GameSort>("rating");
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

  const hasFilters = Boolean(query.trim() || provider);

  return (
    <>
      <StoreSearch
        query={query}
        provider={provider}
        sort={sort}
        providers={providerNames}
        fuse={fuse}
        onQueryChange={setQuery}
        onProviderChange={setProvider}
        onSortChange={setSort}
        onSelectGame={(slug) => router.push(`/play/${slug}`)}
      />
      <div className="mt-8">
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
            void loadMore();
          }}
          isLoading={isLoadingMore}
        />
      </div>
    </>
  );
}
