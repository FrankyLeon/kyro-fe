import { fetchGameCatalog, fetchProviders } from "@/lib/api/server/games";
import { StoreCatalog } from "@/components/store/store-catalog";
import { parseGameSort } from "@/lib/game-search";
import { parsePageParam, storeVisibleCount } from "@/lib/pagination";

interface StorePageProps {
  searchParams: Promise<{
    q?: string;
    provider?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const sort = parseGameSort(params.sort);
  const query = params.q ?? "";
  const provider = params.provider ?? "";

  const [catalog, providers] = await Promise.all([
    fetchGameCatalog({
      q: query,
      provider,
      sort,
      offset: 0,
      limit: storeVisibleCount(page),
    }),
    fetchProviders(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StoreCatalog
        initialGames={catalog.items}
        initialTotal={catalog.total}
        providers={providers}
        initialQuery={query}
        initialProvider={provider}
        initialSort={sort}
        initialPage={page}
      />
    </div>
  );
}
