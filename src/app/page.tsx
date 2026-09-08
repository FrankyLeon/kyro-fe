import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Sparkles, Wallet, Zap } from "lucide-react";
import { fetchGameCatalog } from "@/lib/api/server/games";
import { HOME_POPULAR_SIZE } from "@/lib/pagination";
import { resolveGameImage } from "@/lib/game-image";
import { SITE_CTA } from "@/lib/site-copy";
import { HomeHeroActions } from "@/components/home/home-hero-actions";
import { PopularGames } from "@/components/home/popular-games";
import { HeroStats } from "@/components/home/hero-stats";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Fund your wallet, browse premium games, and bet instantly on Kyro.",
};

export default async function HomePage() {
  const catalog = await fetchGameCatalog({
    sort: "az",
    offset: 0,
    limit: HOME_POPULAR_SIZE,
  });
  const featured = catalog.items.slice(0, 1);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-800/50 min-h-[34rem] sm:min-h-[38rem] lg:min-h-[42rem]">
        <Image
          src="/images/hero-bettor.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[70%_center] sm:object-right scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 from-30% via-zinc-950/92 via-50% to-zinc-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgb(245_158_11/0.12),transparent_55%)]" />

        <div
          className="hero-orb hero-orb-amber -top-20 left-1/4 h-64 w-64"
          aria-hidden
        />
        <div
          className="hero-orb hero-orb-orange bottom-10 right-1/4 h-48 w-48"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl hero-stagger">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 mb-6 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Kyro — online betting
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Real stakes. Real action.{" "}
              <span className="text-gradient-gold">Built for winners.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-300/90 leading-relaxed max-w-xl">
              Fund your wallet, browse games from top providers, and chase your
              next big win — instantly in your browser.
            </p>
            <HomeHeroActions />
            <HeroStats />
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Instant play",
                text: "Start betting in seconds — no install required",
              },
              {
                icon: Wallet,
                title: "Secure wallet",
                text: "Deposit funds and manage your balance in one place",
              },
              {
                icon: Play,
                title: "Instant launch",
                text: "Jump into any game with a single click",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass-card card-shine rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 ring-1 ring-amber-500/20 mb-4">
                  <item.icon className="h-5 w-5 text-amber-400" />
                </span>
                <h3 className="font-display font-semibold text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured[0] ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href={`/games/${featured[0].slug}`}
            className="group relative block overflow-hidden rounded-2xl border border-amber-500/20 glow-amber-strong transition-all duration-500 hover:border-amber-500/40"
          >
            <div className="relative aspect-[21/9] min-h-[220px]">
              <Image
                src={resolveGameImage(
                  featured[0].bannerImage,
                  `${featured[0].slug}-banner`
                )}
                alt={featured[0].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12 max-w-xl">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
                  <Sparkles className="h-3 w-3" />
                  Featured game
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                  {featured[0].title}
                </h2>
                <p className="mt-2 text-zinc-400 line-clamp-2">
                  {featured[0].shortDescription}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-amber-300 font-semibold text-sm group-hover:bg-amber-500/30 group-hover:gap-3 transition-all w-fit">
                  Play now <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hot picks"
          title="Popular games"
          description="Top titles from our providers — your next win could be one click away."
          action={
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/20 hover:text-amber-300"
            >
              {SITE_CTA.viewAllGames}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <PopularGames games={catalog.items} />
      </section>
    </div>
  );
}
