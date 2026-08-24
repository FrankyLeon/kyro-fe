import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Users, Calendar, Building2 } from "lucide-react";
import { fetchGameBySlug } from "@/lib/api/server/games";
import { resolveGameImage } from "@/lib/game-image";
import { Badge } from "@/components/ui/badge";
import { GameDetailActions } from "./game-detail-actions";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);
  if (!game) notFound();

  return (
    <div>
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden border-b border-zinc-800">
        <Image
          src={resolveGameImage(game.bannerImage, `${game.slug}-banner`)}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl lg:-mt-32 z-10">
            <Image
              src={resolveGameImage(game.coverImage, game.slug)}
              alt={game.title}
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>

          <div>
            {game.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {game.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            ) : null}
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {game.title}
            </h1>
            <p className="text-zinc-400 mt-2">{game.shortDescription}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-zinc-300 font-medium">{game.rating}</span>
                ({game.reviewCount.toLocaleString()} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {game.minPlayers}–{game.maxPlayers} players
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {game.developer}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(game.releaseDate).toLocaleDateString()}
              </span>
            </div>

            <GameDetailActions game={game} />

            <div className="mt-10 prose prose-invert max-w-none">
              <h2 className="text-lg font-semibold text-zinc-200 mb-2">
                About this game
              </h2>
              <p className="text-zinc-400 leading-relaxed">{game.description}</p>
              <p className="text-sm text-zinc-500 mt-4">
                Provider: {game.developer} · Instant browser play
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
