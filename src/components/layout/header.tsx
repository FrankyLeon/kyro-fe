"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Dices,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
  HelpCircle,
  Gamepad2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { UserAvatar } from "@/components/user-avatar";
import { cn, formatBalance } from "@/lib/utils";
import { SITE_BRAND } from "@/lib/site-copy";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/store", label: "Games" },
  { href: "/wallet", label: "Wallet" },
  { href: "/support", label: "Support" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 glass-panel shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/30 transition-transform group-hover:scale-105">
            <Dices className="h-5 w-5 text-zinc-950" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-gradient-gold">
            {SITE_BRAND.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname.startsWith(item.href)
                  ? "text-amber-400 bg-amber-500/15 shadow-inner shadow-amber-500/10 ring-1 ring-amber-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoading && user ? (
            <Link
              href="/wallet"
              title="Wallet balance"
              className="balance-chip hidden sm:flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-all hover:shadow-amber-500/30"
            >
              <Wallet className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-amber-300">
                {formatBalance(user.balanceCents, user.currency)}
              </span>
            </Link>
          ) : null}

          {!isLoading && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 transition-colors"
              >
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.displayName}
                  className="h-8 w-8 rounded-full ring-2 ring-zinc-700"
                />
                <span className="text-sm font-medium text-zinc-200 max-w-[100px] truncate">
                  {user.displayName}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : !isLoading ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/register">
                <Button variant="ghost" size="sm">
                  Register
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : null}

          <button
            type="button"
            className="md:hidden p-2 text-zinc-400"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-zinc-800 px-4 py-4 space-y-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              {item.href === "/wallet" ? (
                <Wallet className="h-4 w-4" />
              ) : item.href === "/support" ? (
                <HelpCircle className="h-4 w-4" />
              ) : (
                <Gamepad2 className="h-4 w-4" />
              )}
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm"
              >
                <User className="h-4 w-4" />
                Account
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-red-400"
              >
                Log out
              </button>
            </>
          ) : !isLoading ? (
            <>
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
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
