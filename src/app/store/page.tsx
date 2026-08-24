import { fetchGames } from "@/lib/api/server/games";
import { StoreCatalog } from "@/components/store/store-catalog";
import { parsePageParam } from "@/lib/pagination";

interface StorePageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const games = await fetchGames();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StoreCatalog
        games={games}
        initialQuery={params.q ?? ""}
        initialPage={page}
      />
    </div>
  );
}
