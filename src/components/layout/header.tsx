"use client";

import Link from "next/link";
import {
  Wallet,
  Dices,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { useWalletMenu } from "@/context/wallet-menu-context";
import { UserAvatar } from "@/components/user-avatar";
import { CurrencyIcon } from "@/components/wallet/currency-icon";
import { formatWalletNumber } from "@/lib/utils";
import { SITE_BRAND } from "@/lib/site-copy";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const { openWallet } = useWalletMenu();
  const [mobileOpen, setMobileOpen] = useState(false);

  const walletControls =
    !isLoading && user ? (
      <div className="inline-flex h-9 items-center overflow-hidden rounded-full border border-white/10 bg-zinc-950/70">
        <button
          type="button"
          onClick={() => openWallet("deposit")}
          title="Wallet balance"
          className="flex h-full items-center gap-2 px-3.5 text-sm text-zinc-100 transition-colors hover:bg-white/5"
        >
          <CurrencyIcon size="sm" />
          <span className="tabular-nums font-medium tracking-tight">
            {formatWalletNumber(user.balanceCents)}
          </span>
        </button>
        <span className="h-4 w-px bg-white/10" aria-hidden />
        <button
          type="button"
          onClick={() => openWallet("deposit")}
          className="flex h-full items-center gap-1.5 px-3.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
        >
          <Wallet className="h-3.5 w-3.5" />
          Wallet
        </button>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto grid h-[4.25rem] max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 justify-self-start"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
            <Dices className="h-4 w-4 text-amber-400" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-zinc-100 uppercase">
            {SITE_BRAND.name}
          </span>
        </Link>

        <div className="hidden justify-self-center sm:block">{walletControls}</div>

        <div className="flex items-center justify-end gap-1 justify-self-end">
          {!isLoading && user ? (
            <div className="hidden sm:flex items-center">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 transition-colors hover:bg-white/5"
              >
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.displayName}
                  className="h-7 w-7 rounded-full ring-1 ring-white/10"
                />
                <span className="max-w-[7.5rem] truncate text-[13px] font-medium text-zinc-300">
                  {user.displayName}
                </span>
              </Link>
              <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />
              <button
                type="button"
                onClick={logout}
                className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : !isLoading ? (
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/register">
                <Button variant="ghost" size="sm">
                  Register
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : null}

          <button
            type="button"
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="space-y-1 border-t border-white/10 px-4 py-4 sm:hidden">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  openWallet("deposit");
                  setMobileOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-950/60 px-3.5 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium tabular-nums text-zinc-100">
                  <CurrencyIcon size="sm" />
                  {formatWalletNumber(user.balanceCents)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400">
                  <Wallet className="h-3.5 w-3.5" />
                  Wallet
                </span>
              </button>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5"
              >
                <User className="h-4 w-4 text-zinc-500" />
                Account
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                Log out
              </button>
            </>
          ) : !isLoading ? (
            <div className="flex flex-col gap-2">
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" className="w-full" size="sm">
                  Register
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full" size="sm">
                  Sign in
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
