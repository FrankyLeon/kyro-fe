"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { fetchTransactionHistory } from "@/lib/api/wallet";
import type { TransactionRecord } from "@/types/wallet";
import { formatBalance, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const typeLabels = {
  deposit: "Deposit",
  withdraw: "Withdrawal",
} as const;

interface TransactionHistoryProps {
  refreshKey?: number;
}

export function TransactionHistory({ refreshKey = 0 }: TransactionHistoryProps) {
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTransactionHistory();
        if (!cancelled) setRecords(data);
      } catch (err) {
        if (!cancelled) {
          setRecords([]);
          setError(
            err instanceof Error
              ? err.message
              : "Could not load transaction history."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 py-8 px-4 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 py-10 text-center space-y-2">
        <History className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
        <p className="text-sm text-zinc-500">No transactions yet</p>
        <Link
          href="/wallet"
          className="inline-block text-sm text-amber-400 hover:text-amber-300"
        >
          Make your first deposit
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {records.slice(0, 20).map((tx) => {
        const isWithdraw = tx.type === "withdraw";
        const sign = isWithdraw ? "−" : "+";

        return (
          <li
            key={tx.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm"
          >
            <div>
              <p
                className={`font-medium ${
                  isWithdraw ? "text-zinc-300" : "text-emerald-400"
                }`}
              >
                {sign}
                {formatBalance(tx.amountCents, tx.currency)}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatDateTime(tx.createdAt)} · {typeLabels[tx.type]}
                {tx.reference ? ` · ${tx.reference}` : ""}
              </p>
            </div>
            <Badge
              variant={tx.status === "completed" ? "category" : "default"}
              className="capitalize"
            >
              {tx.status}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
