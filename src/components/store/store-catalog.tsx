"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Game } from "@/types";
import { GameGrid } from "@/components/game/game-grid";
import { StoreHeader } from "@/components/store/store-header";
import { StoreSearch } from "@/components/store/store-search";
import { Pagination } from "@/components/ui/pagination";
import {
  createGameSearchIndex,
  searchGames,
} from "@/lib/game-search";
import { paginate, parsePageParam } from "@/lib/pagination";
import { buildStoreUrl } from "@/lib/store-url";

interface StoreCatalogProps {
  games: Game[];
  initialQuery?: string;
  initialPage: number;
}

function syncStoreUrl(query: string, page: number) {
  const url = buildStoreUrl({
    q: query.trim() || undefined,
    page: page > 1 ? page : undefined,
  });
  window.history.replaceState(null, "", url);
}

export function StoreCatalog({
  games,
  initialQuery = "",
  initialPage,
}: StoreCatalogProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  const fuse = useMemo(() => createGameSearchIndex(games), [games]);

  const filteredGames = useMemo(
    () => searchGames(games, fuse, { query }),
    [games, fuse, query]
  );

  const { items, meta } = useMemo(
    () => paginate(filteredGames, page),
    [filteredGames, page]
  );

  useEffect(() => {
    setQuery(initialQuery);
    setPage(initialPage);
  }, [initialQuery, initialPage]);

  useEffect(() => {
    syncStoreUrl(query, page);
  }, [query, page]);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setPage(parsePageParam(params.get("page") ?? undefined));
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSelectGame(slug: string) {
    router.push(`/play/${slug}`);
  }

  return (
    <>
      <StoreHeader
        totalCount={meta.total}
        rangeStart={meta.start}
        rangeEnd={meta.end}
        page={meta.page}
        totalPages={meta.totalPages}
        searchQuery={query}
      />
      <StoreSearch
        query={query}
        resultCount={filteredGames.length}
        fuse={fuse}
        onQueryChange={handleQueryChange}
        onSelectGame={handleSelectGame}
      />
      <div id="games" className="mt-8 scroll-mt-24">
        <GameGrid
          games={items}
          emptyMessage={
            query
              ? "No games matched your search. Try another keyword."
              : undefined
          }
        />
        <Pagination
          meta={meta}
          search={query}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
