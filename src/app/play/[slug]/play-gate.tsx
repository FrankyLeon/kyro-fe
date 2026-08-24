"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { SITE_CTA } from "@/lib/site-copy";
import { Button } from "@/components/ui/button";

interface PlayGateProps {
  gameSlug: string;
  children: React.ReactNode;
}

export function PlayGate({ gameSlug, children }: PlayGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30 shadow-2xl shadow-black/20 ring-1 ring-white/5">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-400" />
          <p className="text-sm text-zinc-500">Preparing your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-14 text-center shadow-2xl shadow-black/30 ring-1 ring-white/5 sm:px-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="relative mx-auto mb-5 mt-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-amber-500/10 via-zinc-800/80 to-zinc-900/80 shadow-lg shadow-black/30">
          <Lock className="h-7 w-7 text-amber-400" />
        </div>
        <p className="relative text-xl font-semibold text-zinc-100">
          {SITE_CTA.signInToPlay}
        </p>
        <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
          Your account is required before starting a game session.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/store">
            <Button variant="secondary" className="w-full sm:w-auto">
              {SITE_CTA.browseGames}
            </Button>
          </Link>
          <Link href={`/login?redirect=/play/${gameSlug}`}>
            <Button className="w-full sm:w-auto">{SITE_CTA.signIn}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
