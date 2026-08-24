"use client";

import { useState } from "react";
import {
  CreditCard,
  Bitcoin,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createDeposit } from "@/lib/api/deposit";
import {
  DEFAULT_CURRENCY,
  parseCustomDepositCents,
} from "@/lib/deposit-packs";
import { getWalletMinAmountCents } from "@/lib/wallet-config";
import { SITE_CTA } from "@/lib/site-copy";
import type {
  DepositMethod,
  CardPaymentDetails,
  PayPalPaymentDetails,
  CryptoPaymentDetails,
  DepositRecord,
} from "@/types/deposit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatBalance, formatPrice } from "@/lib/utils";
import { PaymentCardForm } from "./payment-card-form";
import { PaymentPayPalForm } from "./payment-paypal-form";
import { PaymentCryptoForm } from "./payment-crypto-form";

type Step = "amount" | "payment" | "success";

const methods: {
  id: DepositMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "card", label: "Credit / Debit", icon: <CreditCard className="h-5 w-5" /> },
  { id: "paypal", label: "PayPal", icon: <Wallet className="h-5 w-5" /> },
  { id: "crypto", label: "Crypto", icon: <Bitcoin className="h-5 w-5" /> },
];

const emptyCard: CardPaymentDetails = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

interface DepositFlowProps {
  onSuccess?: (transaction: DepositRecord) => void;
}

export function DepositFlow({ onSuccess }: DepositFlowProps) {
  const { user, refreshBalance } = useAuth();
  const [step, setStep] = useState<Step>("amount");
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<DepositMethod>("card");
  const [card, setCard] = useState<CardPaymentDetails>(emptyCard);
  const [paypal, setPaypal] = useState<PayPalPaymentDetails>({ email: "" });
  const [crypto, setCrypto] = useState<CryptoPaymentDetails>({ currency: "USDC" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [lastTx, setLastTx] = useState<DepositRecord | null>(null);

  if (!user) return null;

  const currency = user.currency || DEFAULT_CURRENCY;
  const minAmountCents = getWalletMinAmountCents();
  const amountCents = parseCustomDepositCents(customAmount);
  const amountValid = amountCents >= minAmountCents;

  function goToPayment() {
    setError("");
    if (amountCents <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }
    if (amountCents < minAmountCents) {
      setError(
        `Minimum deposit is ${formatBalance(minAmountCents, currency)}.`
      );
      return;
    }
    setStep("payment");
  }

  async function handleConfirm() {
    if (!user) return;
    setError("");
    setProcessing(true);
    try {
      const result = await createDeposit(user, {
        userId: user.id,
        amountCents,
        currency,
        method,
        card: method === "card" ? card : undefined,
        paypal: method === "paypal" ? paypal : undefined,
        crypto: method === "crypto" ? crypto : undefined,
      });
      await refreshBalance();
      setLastTx(result.transaction);
      setStep("success");
      onSuccess?.(result.transaction);
      setCard(emptyCard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deposit failed");
    } finally {
      setProcessing(false);
    }
  }

  function resetFlow() {
    setStep("amount");
    setError("");
    setLastTx(null);
  }

  if (step === "success" && lastTx) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Deposit complete</h2>
        <p className="text-zinc-400 mt-2">
          <span className="text-amber-400 font-semibold">
            +{formatBalance(lastTx.amountCents, lastTx.currency)}
          </span>{" "}
          added to your balance
        </p>
        <p className="text-sm text-zinc-500 mt-4">
          Reference: <span className="font-mono text-zinc-400">{lastTx.reference}</span>
        </p>
        <p className="text-sm text-zinc-500">
          Paid: {formatPrice(lastTx.priceCents, lastTx.currency)} via {lastTx.method}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button onClick={resetFlow} variant="secondary">
            Make another deposit
          </Button>
          <a href="/store">
            <Button>{SITE_CTA.playNow}</Button>
          </a>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setStep("amount")}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Change amount
        </button>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Deposit amount</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatBalance(amountCents, currency)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-300 mb-3">Payment method</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors",
                  method === m.id
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          {method === "card" && (
            <PaymentCardForm value={card} onChange={setCard} />
          )}
          {method === "paypal" && (
            <PaymentPayPalForm
              value={paypal}
              onChange={setPaypal}
              defaultEmail={user.email}
            />
          )}
          {method === "crypto" && (
            <PaymentCryptoForm
              value={crypto}
              onChange={setCrypto}
              priceCents={amountCents}
            />
          )}
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
          onClick={handleConfirm}
          isLoading={processing}
        >
          Confirm deposit · {formatBalance(amountCents, currency)}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
        <Input
          id="custom-amount"
          label={`Amount (${currency})`}
          type="text"
          inputMode="decimal"
          placeholder="e.g. 25.00"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setError("");
          }}
        />
        {amountCents > 0 ? (
          <p className="text-sm text-zinc-400">
            Deposit total:{" "}
            <span className="text-white font-semibold">
              {formatBalance(amountCents, currency)}
            </span>
          </p>
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

      <Button className="w-full" size="lg" onClick={goToPayment} disabled={!amountValid}>
        Continue to payment
      </Button>
    </div>
  );
}
