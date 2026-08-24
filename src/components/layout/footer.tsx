import Link from "next/link";
import { Dices } from "lucide-react";
import { fetchProviders } from "@/lib/api/server/games";
import { buildStoreUrl } from "@/lib/store-url";
import { SITE_BRAND } from "@/lib/site-copy";

export async function Footer() {
  const providers = await fetchProviders();
  const activeProviders = providers.filter((provider) => provider.status === 1);
  const listedProviders = activeProviders.length ? activeProviders : providers;

  return (
    <footer className="relative border-t border-zinc-800/60 bg-zinc-950/80 mt-auto backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                <Dices className="h-4 w-4 text-amber-400" />
              </span>
              <span className="font-display font-bold text-gradient-gold">
                {SITE_BRAND.name}
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Premium online betting. Fund your wallet, browse games by provider,
              and play instantly in your browser.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Providers</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/store" className="hover:text-amber-400 transition-colors">
                  All games
                </Link>
              </li>
              {listedProviders.map((provider) => (
                <li key={provider.providerId}>
                  <Link
                    href={buildStoreUrl({ q: provider.providerName })}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {provider.providerName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/wallet" className="hover:text-amber-400 transition-colors">
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-400 transition-colors">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/support" className="hover:text-amber-400 transition-colors">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="hover:text-amber-400 transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/support/refunds" className="hover:text-amber-400 transition-colors">
                  Refund policy
                </Link>
              </li>
              <li>
                <Link href="/support/responsible-gaming" className="hover:text-amber-400 transition-colors">
                  Responsible gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <span>
            © {new Date().getFullYear()} {SITE_BRAND.name}. All rights reserved.
          </span>
          <span>18+ · Play responsibly</span>
        </div>
      </div>
    </footer>
  );
}
