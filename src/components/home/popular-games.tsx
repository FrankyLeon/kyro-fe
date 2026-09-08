import type { Game } from "@/types";
import { GameGrid } from "@/components/game/game-grid";

interface PopularGamesProps {
  games: Game[];
}

export function PopularGames({ games }: PopularGamesProps) {
  return (
    <div className="mt-8">
      <GameGrid games={games} />
    </div>
  );
}
