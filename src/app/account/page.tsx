"use client";

import { useEffect } from "react";
import Link from "next/link";
import { User, Wallet, Dices, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { useWalletMenu } from "@/context/wallet-menu-context";
import { GuestAuthPrompt } from "@/components/auth/guest-auth-prompt";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { useI18n } from "@/context/locale-context";
import { formatBalance } from "@/lib/utils";

export default function AccountPage() {
  const { t, intl } = useI18n();
  const { user, isLoading, refreshBalance } = useAuth();
  const logout = useLogout();
  const { openWallet } = useWalletMenu();

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
        title={t("account.title")}
        description={t("account.guestBody")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t("account.title")}</h1>

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
                {t("account.playerCode", { code: user.playerCode })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80 mb-2">
            {t("account.walletBalance")}
          </p>
          <BalanceDisplay user={user} />
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => openWallet("deposit")}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <Wallet className="h-4 w-4 text-amber-400" />
              {t("account.walletDeposits")}
            </span>
            <span className="font-semibold text-amber-400">
              {formatBalance(user.balanceCents, user.currency, intl)}
            </span>
          </button>
          <Link
            href="/store"
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <Dices className="h-4 w-4" />
              {t("cta.browseGames")}
            </span>
            <span className="text-amber-400 text-sm">{t("account.open")}</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <HelpCircle className="h-4 w-4" />
              {t("account.help")}
            </span>
            <span className="text-amber-400 text-sm">{t("account.open")}</span>
          </Link>
        </div>

        <Button variant="danger" className="w-full mt-6" onClick={logout}>
          {t("account.signOut")}
        </Button>
      </div>

      <p className="text-xs text-zinc-600 mt-6 text-center flex items-center justify-center gap-1">
        <User className="h-3 w-3" />
        {t("account.memberSince", {
          date: new Date(user.createdAt).toLocaleDateString(intl),
        })}
      </p>
    </div>
  );
}
