"use client";

import { useEffect } from "react";
import Link from "next/link";
import { User, Wallet, Dices, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { GuestAuthPrompt } from "@/components/auth/guest-auth-prompt";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { SITE_CTA } from "@/lib/site-copy";
import { formatBalance } from "@/lib/utils";

export default function AccountPage() {
  const { user, isLoading, refreshBalance } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    if (user) {
      void refreshBalance();
    }
  }, [user, refreshBalance]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <GuestAuthPrompt
        redirect="/account"
        title="Account"
        description="Sign in to view your balance and profile."
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">Account</h1>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={user.avatarUrl}
            name={user.displayName}
            className="h-16 w-16 rounded-full ring-2 ring-zinc-700"
          />
          <div>
            <p className="text-xl font-semibold text-zinc-100">{user.displayName}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
            {user.playerCode ? (
              <p className="text-xs text-zinc-600 mt-1">
                Player code · {user.playerCode}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80 mb-2">
            Wallet balance
          </p>
          <BalanceDisplay user={user} />
        </div>

        <div className="mt-6 grid gap-3">
          <Link
            href="/wallet"
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <Wallet className="h-4 w-4 text-amber-400" />
              Wallet & deposits
            </span>
            <span className="font-semibold text-amber-400">
              {formatBalance(user.balanceCents, user.currency)}
            </span>
          </Link>
          <Link
            href="/store"
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <Dices className="h-4 w-4" />
              {SITE_CTA.browseGames}
            </span>
            <span className="text-amber-400 text-sm">Open →</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <HelpCircle className="h-4 w-4" />
              Help & support
            </span>
            <span className="text-amber-400 text-sm">Open →</span>
          </Link>
        </div>

        <Button variant="danger" className="w-full mt-6" onClick={logout}>
          Sign out
        </Button>
      </div>

      <p className="text-xs text-zinc-600 mt-6 text-center flex items-center justify-center gap-1">
        <User className="h-3 w-3" />
        Member since {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
