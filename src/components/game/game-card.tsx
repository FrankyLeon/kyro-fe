"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import type { Game } from "@/types";
import { resolveGameImage } from "@/lib/game-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { SITE_CTA } from "@/lib/site-copy";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { user, isLoading } = useAuth();
  const playHref = user
    ? `/play/${game.slug}`
    : `/login?redirect=/play/${game.slug}`;

  const buttonLabel = isLoading
    ? SITE_CTA.playNow
    : user
      ? SITE_CTA.playNow
      : SITE_CTA.signInToPlay;

  return (
    <article className="group card-shine flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
      <Link
        href={`/games/${game.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-zinc-800 block"
      >
        <Image
          src={resolveGameImage(game.coverImage, game.slug)}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

        {game.featured ? (
          <span className="absolute top-3 left-3 z-10">
            <Badge variant="gold">Featured</Badge>
          </span>
        ) : null}

        <span className="absolute top-3 right-3 z-10 rounded-full border border-zinc-700/60 bg-zinc-950/70 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400 backdrop-blur-sm">
          {game.developer}
        </span>

        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/40 scale-90 transition-transform duration-300 group-hover:scale-100">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 gap-2">
        <Link href={`/games/${game.slug}`}>
          <h3 className="font-display font-semibold text-zinc-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
            {game.title}
          </h3>
        </Link>
        <p className="text-xs text-zinc-500 line-clamp-2 flex-1 leading-relaxed">
          {game.shortDescription}
        </p>
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-zinc-300">{game.rating}</span>
        </div>
        <Link
          href={playHref}
          className="pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button className="w-full shadow-md shadow-amber-500/10" size="sm">
            <Play className="h-4 w-4" />
            {buttonLabel}
          </Button>
        </Link>
      </div>
    </article>
  );
}
