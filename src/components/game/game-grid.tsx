import Link from "next/link";
import type { Game } from "@/types";
import { GameCard } from "./game-card";
import { cn } from "@/lib/utils";

interface GameGridProps {
  games: Game[];
  emptyMessage?: string;
  className?: string;
}

export function GameGrid({ games, emptyMessage, className }: GameGridProps) {
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
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7",
        className
      )}
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
