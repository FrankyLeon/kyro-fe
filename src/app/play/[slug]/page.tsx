import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Star,
  Users,
} from "lucide-react";
import { fetchGameBySlug } from "@/lib/api/server/games";
import { GameLauncher } from "@/components/play/game-launcher";
import { Badge } from "@/components/ui/badge";
import { resolveGameImage } from "@/lib/game-image";
import { PlayGate } from "./play-gate";

interface PlayPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);
  if (!game) notFound();

  return (
    <div className="pb-20">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="relative h-48 sm:h-60">
          <Image
            src={resolveGameImage(game.bannerImage, `${game.slug}-banner`)}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(245_158_11_/_0.1),_transparent_55%)]" />
          <div className="bg-grid absolute inset-0 opacity-[0.18]" />

          <div className="absolute inset-x-0 top-0 mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950/50 px-3.5 py-1.5 text-sm text-zinc-300 backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-zinc-950/70 hover:text-amber-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to games
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 mb-10 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:gap-8">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="glow-amber relative h-32 w-24 overflow-hidden rounded-2xl border border-zinc-700/60 shadow-2xl shadow-black/50 ring-2 ring-zinc-950 sm:h-40 sm:w-32">
              <Image
                src={resolveGameImage(game.coverImage, game.slug)}
                alt={game.title}
                fill
                className="object-cover"
                sizes="128px"
                priority
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
            {game.featured ? (
              <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="gold">Featured</Badge>
              </div>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {game.title}
            </h1>
            <p className="mx-auto mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-zinc-400 sm:mx-0">
              {game.shortDescription}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-zinc-500 sm:justify-start">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-zinc-300">{game.rating}</span>
                <span className="text-zinc-600">
                  ({game.reviewCount.toLocaleString()})
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {game.minPlayers}–{game.maxPlayers} players
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {game.developer}
              </span>
            </div>
          </div>

          <Link
            href={`/games/${game.slug}`}
            className="mx-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400 backdrop-blur-sm transition-all hover:border-zinc-600 hover:text-zinc-200 sm:mx-0 sm:mb-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Game details
          </Link>
        </div>

        <PlayGate gameSlug={game.slug}>
          <GameLauncher game={game} />
        </PlayGate>
      </div>
    </div>
  );
}
