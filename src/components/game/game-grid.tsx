import Link from "next/link";
import type { Game } from "@/types";
import { GameCard } from "./game-card";

interface GameGridProps {
  games: Game[];
  emptyMessage?: string;
}

export function GameGrid({ games, emptyMessage }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center space-y-3">
        <p className="text-zinc-500">
          {emptyMessage ?? "No games available right now."}
        </p>
        {!emptyMessage ? (
          <Link
            href="/support/contact"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Contact support
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
