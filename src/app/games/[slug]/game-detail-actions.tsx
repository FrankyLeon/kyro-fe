"use client";

import Link from "next/link";
import { Play, Wallet, LogIn } from "lucide-react";
import type { Game } from "@/types";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/locale-context";
import { getMinBalanceToPlayCents } from "@/lib/wallet-config";
import { formatBalance } from "@/lib/utils";

export function GameDetailActions({ game }: { game: Game }) {
  const { t, intl } = useI18n();
  const { user, isLoading } = useAuth();
  const lowBalance =
    user != null && user.balanceCents < getMinBalanceToPlayCents();

  if (isLoading) {
    return <div className="mt-6 h-12" />;
  }

  if (!user) {
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/login?redirect=/play/${game.slug}`}>
          <Button size="lg">
            <LogIn className="h-5 w-5" />
            {t("cta.signInToPlay")}
          </Button>
        </Link>
        <Link href="/store">
          <Button variant="ghost" size="lg">
            {t("games.backToGames")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        <Link href={`/play/${game.slug}`}>
          <Button size="lg">
            <Play className="h-5 w-5" />
            {t("cta.playNow")}
          </Button>
        </Link>
        {lowBalance ? (
          <Link href="/wallet">
            <Button variant="outline" size="lg">
              <Wallet className="h-5 w-5" />
              {t("games.depositFunds")}
            </Button>
          </Link>
        ) : null}
      </div>
      <p className="text-sm text-zinc-500">
        {t("games.balance")}{" "}
        <span className="text-amber-400 font-medium">
          {formatBalance(user.balanceCents, user.currency, intl)}
        </span>
        {lowBalance ? (
          <span className="text-amber-400/80">
            {" "}
            {t("games.depositRecommended")}
          </span>
        ) : null}
      </p>
    </div>
  );
}
