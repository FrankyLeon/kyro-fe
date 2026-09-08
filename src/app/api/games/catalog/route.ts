import { NextResponse } from "next/server";
import { fetchGameCatalog } from "@/lib/api/server/games/catalog-page";
import { parseGameSort } from "@/lib/game-search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = Number.parseInt(searchParams.get("limit") ?? "0", 10);

    const page = await fetchGameCatalog({
      q: searchParams.get("q") ?? undefined,
      provider: searchParams.get("provider") ?? undefined,
      sort: parseGameSort(searchParams.get("sort")),
      offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
      limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    });

    return NextResponse.json(page);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load games.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
