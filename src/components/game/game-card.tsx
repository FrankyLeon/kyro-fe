"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Game } from "@/types";
import { resolveGameImage } from "@/lib/game-image";
import { formatCategoryLabel, formatProviderLabel } from "@/lib/site-copy";
import { useAuth } from "@/context/auth-context";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { user } = useAuth();
  const playHref = user
    ? `/play/${game.slug}`
    : `/login?redirect=/play/${game.slug}`;
  const provider = formatProviderLabel(game);
  const category = formatCategoryLabel(game.category);

  return (
    <article className="group relative z-0 isolate overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-transparent transition-[box-shadow,ring-color] duration-300 hover:ring-2 hover:ring-amber-400">
      <Link
        href={playHref}
        className="relative block aspect-[7/10] overflow-hidden bg-zinc-800"
      >
        <Image
          src={resolveGameImage(game.coverImage, game.slug)}
          alt={game.title}
          fill
          className="object-cover transition-[filter,transform] duration-300 group-hover:scale-110 group-hover:blur-sm group-hover:brightness-[0.35]"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 14vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

        <div className="absolute inset-x-0 bottom-0 p-2.5 transition-opacity duration-300 group-hover:opacity-0 sm:p-3">
          <h3 className="font-display text-sm font-bold uppercase leading-tight text-white line-clamp-2 sm:text-base">
            {game.title}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 sm:text-xs">
            {provider}
          </p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center px-3 py-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="pt-1">
            <h3 className="font-display text-sm font-bold leading-tight text-amber-400 line-clamp-2 sm:text-base">
              {game.title}
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-amber-400 sm:text-sm">
              {provider}
            </p>
          </div>

          <Play className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 fill-amber-400 text-amber-400 drop-shadow-lg sm:h-14 sm:w-14" />

          <p className="mt-auto text-[11px] font-semibold text-amber-400 sm:text-sm">
            {category}
          </p>
        </div>
      </Link>
    </article>
  );
}
