"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createDeposit } from "@/lib/api/deposit";
import {
  DEFAULT_CURRENCY,
  parseCustomDepositCents,
} from "@/lib/deposit-packs";
import { getWalletMinAmountCents } from "@/lib/wallet-config";
import { SITE_CTA } from "@/lib/site-copy";
import { DEPOSIT_PAYMENT_OPTIONS } from "@/lib/payment-methods";
import { useDepositDestinations } from "@/hooks/use-deposit-destinations";
import type {
  DepositMethod,
  CardPaymentDetails,
  PayPalPaymentDetails,
  CryptoPaymentDetails,
  CryptoCurrency,
  DepositRecord,
} from "@/types/deposit";
import { Button } from "@/components/ui/button";
import { formatWalletAmount, formatWalletNumber } from "@/lib/utils";
import { PaymentCardForm } from "./payment-card-form";
import { PaymentPayPalForm } from "./payment-paypal-form";
import {
  MethodGlyph,
  QrCodeImage,
  WalletActionButton,
  WalletAmountInput,
  WalletBalanceField,
  WalletCopyField,
  WalletMetaRow,
  WalletSelect,
} from "@/components/wallet/wallet-ui";
import { CurrencyIcon } from "@/components/wallet/currency-icon";

const emptyCard: CardPaymentDetails = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

interface DepositFlowProps {
  onSuccess?: (transaction: DepositRecord) => void;
}

function InstructionBlock({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/8 bg-[#1c1e28] px-4 py-4 text-center text-[13px] leading-relaxed text-zinc-300">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function MissingDestination({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-white/8 bg-[#1c1e28] px-4 py-3 text-center text-sm text-zinc-400">
      {message}
    </p>
  );
}

export function DepositFlow({ onSuccess }: DepositFlowProps) {
  const { user, refreshBalance } = useAuth();
  const { destinations, loading } = useDepositDestinations();
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<DepositMethod>("bank");
  const [card, setCard] = useState<CardPaymentDetails>(emptyCard);
  const [paypal, setPaypal] = useState<PayPalPaymentDetails>({ email: "" });
  const [crypto, setCrypto] = useState<CryptoPaymentDetails>({
    currency: "USDT",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [lastTx, setLastTx] = useState<DepositRecord | null>(null);

  const paymentOptions = useMemo(() => {
    const enabledIds = new Set(
      destinations.methods.filter((item) => item.enabled).map((item) => item.id)
    );
    const filtered = DEPOSIT_PAYMENT_OPTIONS.filter((option) =>
      enabledIds.has(option.id)
    ).map((option) => ({
      ...option,
      label:
        destinations.methods.find((item) => item.id === option.id)?.label ||
        option.label,
    }));

    return filtered.length > 0 ? filtered : DEPOSIT_PAYMENT_OPTIONS;
  }, [destinations.methods]);

  const cryptoNetworks = useMemo(() => {
    const withAddress = destinations.crypto.networks.filter(
      (network) => network.address
    );
    return withAddress.length > 0 ? withAddress : destinations.crypto.networks;
  }, [destinations.crypto.networks]);

  useEffect(() => {
    if (!paymentOptions.some((option) => option.id === method)) {
      setMethod(paymentOptions[0]?.id ?? "bank");
    }
  }, [method, paymentOptions]);

  useEffect(() => {
    if (!cryptoNetworks.some((network) => network.id === crypto.currency)) {
      const next = cryptoNetworks[0]?.id;
      if (next) setCrypto({ currency: next });
    }
  }, [crypto.currency, cryptoNetworks]);

  if (!user) return null;

  const currency = user.currency || DEFAULT_CURRENCY;
  const minAmountCents = getWalletMinAmountCents();
  const amountCents = parseCustomDepositCents(customAmount);
  const amountValid = amountCents >= minAmountCents;
  const selectedMethod =
    paymentOptions.find((item) => item.id === method) ?? paymentOptions[0];
  const selectedNetwork =
    cryptoNetworks.find((network) => network.id === crypto.currency) ??
    cryptoNetworks[0];
  const cryptoAddress = selectedNetwork?.address ?? "";
  const bankAccount = [destinations.bank.accountNumber, destinations.bank.accountHolder]
    .filter(Boolean)
    .join(" - ");

  async function handleConfirm() {
    if (!user) return;
    setError("");

    if (amountCents <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }
    if (amountCents < minAmountCents) {
      setError(
        `Minimum deposit is ${formatWalletAmount(minAmountCents, currency)}.`
      );
      return;
    }
    if (method === "bank" && !destinations.bank.accountNumber) {
      setError("Bank deposit details are not configured yet.");
      return;
    }
    if (method === "crypto" && !cryptoAddress) {
      setError("Crypto deposit addresses are not configured yet.");
      return;
    }
    if (method === "card") {
      const digits = card.cardNumber.replace(/\D/g, "");
      if (!card.cardholderName.trim() || digits.length < 13 || !card.expiry || card.cvc.length < 3) {
        setError("Enter complete card details.");
        return;
      }
    }
    if (method === "paypal") {
      const email = paypal.email.trim() || user.email;
      if (!email) {
        setError("Enter your PayPal email.");
        return;
      }
      if (!destinations.paypal.email) {
        setError("PayPal receiving email is not configured yet.");
        return;
      }
    }

    setProcessing(true);
    try {
      const result = await createDeposit(user, {
        userId: user.id,
        amountCents,
        currency,
        method,
        card: method === "card" ? card : undefined,
        paypal:
          method === "paypal"
            ? { email: paypal.email.trim() || user.email }
            : undefined,
        crypto: method === "crypto" ? crypto : undefined,
      });
      await refreshBalance();
      setLastTx(result.transaction);
      onSuccess?.(result.transaction);
      setCard(emptyCard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deposit failed");
    } finally {
      setProcessing(false);
    }
  }

  function resetFlow() {
    setError("");
    setLastTx(null);
    setCustomAmount("");
  }

  if (lastTx) {
    const pending = lastTx.status === "pending";
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">
          {pending ? "Deposit submitted" : "Deposit complete"}
        </h2>
        <p className="mt-2 text-zinc-400">
          <span className="font-semibold text-white">
            +{formatWalletAmount(lastTx.amountCents, lastTx.currency)}
          </span>{" "}
          {pending
            ? "is waiting for payment confirmation. Your balance updates after approval."
            : "added to your balance"}
        </p>
        {lastTx.reference ? (
          <p className="mt-4 text-sm text-zinc-500">
            Reference:{" "}
            <span className="font-mono text-zinc-400">{lastTx.reference}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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

  return (
    <div className="space-y-3">
      <WalletBalanceField
        amountLabel={formatWalletAmount(user.balanceCents, currency)}
      />

      <WalletSelect
        label="Payments Method"
        value={method}
        onChange={setMethod}
        icon={<MethodGlyph kind={selectedMethod?.icon ?? "bank"} />}
        options={paymentOptions.map((option) => ({
          id: option.id,
          label: option.label,
          icon: <MethodGlyph kind={option.icon} />,
        }))}
      />

      {loading ? (
        <p className="px-1 text-xs text-zinc-500">Loading deposit details…</p>
      ) : null}

      {method === "bank" ? (
        <>
          <InstructionBlock lines={destinations.bank.instructions} />
          {bankAccount ? (
            <WalletCopyField label="Bank Account" value={bankAccount} />
          ) : (
            <MissingDestination message="Bank deposit details are not configured yet." />
          )}
        </>
      ) : null}

      {method === "crypto" ? (
        <>
          <p className="px-1 pt-1 text-sm font-medium text-white">
            Choose currency and standard
          </p>
          {cryptoNetworks.length > 0 ? (
            <WalletSelect
              label="Currency"
              value={selectedNetwork?.id ?? crypto.currency}
              onChange={(id: CryptoCurrency) => setCrypto({ currency: id })}
              options={cryptoNetworks.map((network) => ({
                id: network.id,
                label: network.label,
              }))}
            />
          ) : null}
          {cryptoAddress ? (
            <>
              <div className="py-2">
                <QrCodeImage value={cryptoAddress} />
              </div>
              <WalletCopyField label="Crypto Address" value={cryptoAddress} />
            </>
          ) : (
            <MissingDestination message="Crypto deposit addresses are not configured yet." />
          )}
          <WalletMetaRow
            label="Min. Amount"
            value={formatWalletNumber(minAmountCents)}
            icon={<CurrencyIcon size="sm" />}
          />
        </>
      ) : null}

      {method === "card" ? (
        <div className="space-y-3">
          <InstructionBlock lines={destinations.card.instructions} />
          <div className="rounded-xl border border-white/8 bg-[#1c1e28] p-4">
            <PaymentCardForm value={card} onChange={setCard} />
          </div>
        </div>
      ) : null}

      {method === "paypal" ? (
        <div className="space-y-3">
          <InstructionBlock lines={destinations.paypal.instructions} />
          {destinations.paypal.email ? (
            <WalletCopyField
              label="PayPal account"
              value={destinations.paypal.email}
            />
          ) : (
            <MissingDestination message="PayPal receiving email is not configured yet." />
          )}
          <div className="rounded-xl border border-white/8 bg-[#1c1e28] p-4">
            <PaymentPayPalForm
              value={paypal}
              onChange={setPaypal}
              defaultEmail={user.email}
            />
          </div>
        </div>
      ) : null}

      <WalletAmountInput
        id="deposit-amount"
        label="Deposit amount"
        value={customAmount || "0"}
        onChange={(value) => {
          setCustomAmount(value === "0" ? "" : value);
          setError("");
        }}
      />

      {method !== "crypto" ? (
        <WalletMetaRow
          label="Min. Amount"
          value={formatWalletNumber(minAmountCents)}
          icon={<CurrencyIcon size="sm" />}
        />
      ) : null}

      {method === "bank" ? (
        <p className="flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-zinc-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Confirm after you send the transfer. Your balance is credited after
          the payment is approved in wp-admin.
        </p>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <WalletActionButton
        onClick={() => void handleConfirm()}
        isLoading={processing}
        disabled={!amountValid}
      >
        {method === "card" ? "Submit deposit" : "I sent the payment"}
      </WalletActionButton>
    </div>
  );
}
