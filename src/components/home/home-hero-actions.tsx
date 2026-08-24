"use client";

import Link from "next/link";
import { ArrowRight, Play, Wallet } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useWalletMenu } from "@/context/wallet-menu-context";
import { SITE_CTA } from "@/lib/site-copy";
import { Button } from "@/components/ui/button";

export function HomeHeroActions() {
  const { user, isLoading } = useAuth();
  const { openWallet } = useWalletMenu();

  if (isLoading) {
    return (
      <div className="mt-8">
        <Button size="lg" disabled>
          {SITE_CTA.browseGames}
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
            {SITE_CTA.playNow}
          </Button>
        </Link>
        <Button
          size="lg"
          onClick={() => openWallet("deposit")}
          className="bg-gradient-to-r from-[#6b4eea] to-[#4e8bea] text-white shadow-lg shadow-indigo-500/20 hover:opacity-95"
        >
          <Wallet className="h-5 w-5" />
          Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Link href="/store">
        <Button size="lg" className="btn-pulse">
          {SITE_CTA.browseGames}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
      <Link href="/login">
        <Button variant="outline" size="lg">
          {SITE_CTA.signIn}
        </Button>
      </Link>
    </div>
  );
}
