"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { GuestAuthPrompt } from "@/components/auth/guest-auth-prompt";
import { WalletMenu, type WalletMenuTab } from "@/components/wallet/wallet-menu";
import { TransactionHistory } from "@/components/wallet/transaction-history";

export default function WalletPage() {
  const { user, isLoading, refreshBalance } = useAuth();
  const [tab, setTab] = useState<WalletMenuTab>("deposit");
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
      <div className="mb-10 flex justify-center">
        <WalletMenu
          tab={tab}
          onTabChange={setTab}
          onSuccess={handleTransactionSuccess}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Recent transactions
        </h2>
        <TransactionHistory refreshKey={historyKey} />
      </section>
    </div>
  );
}
