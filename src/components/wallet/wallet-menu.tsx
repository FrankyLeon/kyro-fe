"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DepositFlow } from "@/components/deposit/deposit-flow";
import { WithdrawFlow } from "@/components/wallet/withdraw-flow";
import type { DepositRecord } from "@/types/deposit";
import type { WalletTransferResult } from "@/types/wallet";

export type WalletMenuTab = "deposit" | "withdraw";

interface WalletMenuProps {
  tab: WalletMenuTab;
  onTabChange: (tab: WalletMenuTab) => void;
  onClose?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export function WalletMenu({
  tab,
  onTabChange,
  onClose,
  onSuccess,
  className,
}: WalletMenuProps) {
  function handleDepositSuccess(_transaction: DepositRecord) {
    onSuccess?.();
  }

  function handleWithdrawSuccess(_result: WalletTransferResult) {
    onSuccess?.();
  }

  return (
    <div
      className={cn(
        "w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/8 bg-[#14151c] shadow-2xl shadow-black/50",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 id="wallet-menu-title" className="text-lg font-semibold text-white">
          Wallet Menu
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close wallet menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2 px-5">
        {(
          [
            { id: "deposit" as const, label: "Deposit" },
            { id: "withdraw" as const, label: "Withdraw" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              "h-10 flex-1 rounded-full text-sm font-semibold transition-colors",
              tab === item.id
                ? "bg-[#5b8def] text-white"
                : "bg-[#2a2d38] text-zinc-300 hover:bg-[#323640]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="max-h-[min(70vh,40rem)] overflow-y-auto px-5 py-4">
        {tab === "deposit" ? (
          <DepositFlow onSuccess={handleDepositSuccess} />
        ) : (
          <WithdrawFlow onSuccess={handleWithdrawSuccess} />
        )}
      </div>
    </div>
  );
}
