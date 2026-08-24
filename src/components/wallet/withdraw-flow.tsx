"use client";

import { useState } from "react";
import { AlertCircle, ArrowDownToLine, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createWithdraw } from "@/lib/api/wallet";
import { DEFAULT_CURRENCY } from "@/lib/deposit-packs";
import {
  parseWithdrawAmount,
  parseWithdrawCents,
} from "@/lib/withdraw-limits";
import { getWalletMinAmountCents } from "@/lib/wallet-config";
import type { WalletTransferResult } from "@/types/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBalance } from "@/lib/utils";

type Step = "amount" | "confirm" | "success";

interface WithdrawFlowProps {
  onSuccess?: (result: WalletTransferResult) => void;
}

export function WithdrawFlow({ onSuccess }: WithdrawFlowProps) {
  const { user, refreshBalance } = useAuth();
  const [step, setStep] = useState<Step>("amount");
  const [amountInput, setAmountInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<WalletTransferResult | null>(
    null
  );

  if (!user) return null;

  const currency = user.currency || DEFAULT_CURRENCY;
  const minAmountCents = getWalletMinAmountCents();
  const amountCents = parseWithdrawCents(amountInput);
  const amount = parseWithdrawAmount(amountInput);
  const exceedsBalance = amountCents > user.balanceCents;
  const amountValid = amountCents >= minAmountCents && !exceedsBalance;

  function goToConfirm() {
    setError("");
    if (amountCents <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }
    if (amountCents < minAmountCents) {
      setError(
        `Minimum withdrawal is ${formatBalance(minAmountCents, currency)}.`
      );
      return;
    }
    if (exceedsBalance) {
      setError("Amount exceeds your available balance.");
      return;
    }
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!user || !amountValid) return;
    setError("");
    setProcessing(true);
    try {
      const result = await createWithdraw(user, { amount, currency });
      await refreshBalance();
      setLastResult(result);
      setStep("success");
      onSuccess?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Withdrawal failed.");
    } finally {
      setProcessing(false);
    }
  }

  function resetFlow() {
    setStep("amount");
    setAmountInput("");
    setError("");
    setLastResult(null);
  }

  if (step === "success" && lastResult) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Withdrawal submitted</h2>
        <p className="text-zinc-400 mt-2">
          <span className="text-zinc-200 font-semibold">
            −{formatBalance(Math.round(lastResult.transferAmount * 100), lastResult.currency)}
          </span>{" "}
          withdrawn from your balance
        </p>
        <p className="text-sm text-zinc-500 mt-4">
          New balance:{" "}
          <span className="text-amber-400 font-medium">
            {formatBalance(
              Math.round(lastResult.balance * 100),
              lastResult.currency
            )}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button onClick={resetFlow} variant="secondary">
            Make another withdrawal
          </Button>
          <a href="/account">
            <Button>View account</Button>
          </a>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div>
            <p className="text-sm text-zinc-500">Withdrawal amount</p>
            <p className="text-2xl font-bold text-white mt-1">
              {formatBalance(amountCents, currency)}
            </p>
          </div>
          <div className="border-t border-zinc-800 pt-4 flex justify-between text-sm">
            <span className="text-zinc-500">Available balance</span>
            <span className="text-zinc-300">
              {formatBalance(user.balanceCents, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Balance after withdrawal</span>
            <span className="text-amber-400 font-medium">
              {formatBalance(user.balanceCents - amountCents, currency)}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Withdrawals are processed securely. Processing time may vary depending
          on your payment method.
        </p>

        {error ? (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setStep("amount")}
            disabled={processing}
          >
            Back
          </Button>
          <Button
            className="flex-1"
            size="lg"
            onClick={handleConfirm}
            isLoading={processing}
          >
            Confirm withdrawal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-zinc-500">Available to withdraw</span>
        <span className="font-semibold text-amber-400">
          {formatBalance(user.balanceCents, currency)}
        </span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
        <Input
          id="withdraw-amount"
          label={`Amount (${currency})`}
          type="text"
          inputMode="decimal"
          placeholder="e.g. 25.00"
          value={amountInput}
          onChange={(e) => {
            setAmountInput(e.target.value);
            setError("");
          }}
        />
        {amountCents > 0 && !exceedsBalance ? (
          <p className="text-sm text-zinc-400">
            Withdrawal total:{" "}
            <span className="text-white font-semibold">
              {formatBalance(amountCents, currency)}
            </span>
          </p>
        ) : null}
        {exceedsBalance && amountCents > 0 ? (
          <p className="text-sm text-red-400">Exceeds available balance.</p>
        ) : null}
        <p className="text-xs text-zinc-600">
          Minimum {formatBalance(minAmountCents, currency)}
        </p>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <Button
        className="w-full"
        size="lg"
        onClick={goToConfirm}
        disabled={!amountValid}
      >
        <ArrowDownToLine className="h-5 w-5" />
        Continue to confirm
      </Button>
    </div>
  );
}
