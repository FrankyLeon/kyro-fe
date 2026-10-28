"use client";

import Link from "next/link";
import { ArrowRight, Play, Wallet } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useWalletMenu } from "@/context/wallet-menu-context";
import { useI18n } from "@/context/locale-context";
import { Button } from "@/components/ui/button";

export function HomeHeroActions() {
  const { t } = useI18n();
  const { user, isLoading } = useAuth();
  const { openWallet } = useWalletMenu();

  if (isLoading) {
    return (
      <div className="mt-8">
        <Button size="lg" disabled>
          {t("cta.browseGames")}
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/store">
          <Button size="lg" className="btn-pulse">
            <Play className="h-5 w-5" />
            {t("cta.playNow")}
          </Button>
        </Link>
        <Button
          size="lg"
          onClick={() => openWallet("deposit")}
          className="bg-gradient-to-r from-[#6b4eea] to-[#4e8bea] text-white shadow-lg shadow-indigo-500/20 hover:opacity-95"
        >
          <Wallet className="h-5 w-5" />
          {t("home.wallet")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Link href="/store">
        <Button size="lg" className="btn-pulse">
          {t("cta.browseGames")}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
      <Link href="/login">
        <Button variant="outline" size="lg">
          {t("cta.signIn")}
        </Button>
      </Link>
    </div>
  );
}
