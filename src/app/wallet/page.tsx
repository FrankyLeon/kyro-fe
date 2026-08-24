"use client";

import { useEffect, useState } from "react";
import { Wallet, Shield } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { GuestAuthPrompt } from "@/components/auth/guest-auth-prompt";
import { DepositFlow } from "@/components/deposit/deposit-flow";
import { WithdrawFlow } from "@/components/wallet/withdraw-flow";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { cn } from "@/lib/utils";

type WalletTab = "deposit" | "withdraw";

export default function WalletPage() {
  const { user, isLoading, refreshBalance } = useAuth();
  const [tab, setTab] = useState<WalletTab>("deposit");
  const [historyKey, setHistoryKey] = useState(0);

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
        redirect="/wallet"
        title="Wallet"
        description="Sign in to manage your balance, deposits, and withdrawals."
      />
    );
  }

  function handleTransactionSuccess() {
    setHistoryKey((k) => k + 1);
    void refreshBalance();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">
        Wallet
      </h1>
      <p className="text-zinc-500 mb-8">
        Deposit funds, withdraw winnings, and track your balance
      </p>

      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-zinc-900 p-8 mb-8 glow-amber shadow-xl shadow-amber-500/5">
        <p className="text-sm text-amber-400/80 font-medium uppercase tracking-wider">
          Account balance
        </p>
        <div className="mt-2 flex items-start gap-3">
          <Wallet className="h-10 w-10 shrink-0 text-amber-400" />
          <BalanceDisplay user={user} size="lg" />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-4 py-3 mb-8 text-xs text-zinc-500">
        <Shield className="h-4 w-4 shrink-0 text-emerald-500/80 mt-0.5" />
        <span>
          Deposits and withdrawals are processed securely. Completed transactions
          update your balance and appear in your history below.
        </span>
      </div>

      <div className="flex rounded-lg border border-zinc-800 p-1 bg-zinc-900/50 mb-8">
        {(
          [
            { id: "deposit" as const, label: "Deposit" },
            { id: "withdraw" as const, label: "Withdraw" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex-1 py-2.5 rounded-md text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-amber-500/20 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4">
          {tab === "deposit" ? "New deposit" : "Withdraw funds"}
        </h2>
        {tab === "deposit" ? (
          <DepositFlow onSuccess={handleTransactionSuccess} />
        ) : (
          <WithdrawFlow onSuccess={handleTransactionSuccess} />
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-200 mb-4">
          Recent transactions
        </h2>
        <TransactionHistory refreshKey={historyKey} />
      </section>
    </div>
  );
}
