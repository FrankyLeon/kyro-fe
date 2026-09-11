"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createWithdraw } from "@/lib/api/wallet";
import { DEFAULT_CURRENCY } from "@/lib/deposit-packs";
import {
  parseWithdrawAmount,
  parseWithdrawCents,
} from "@/lib/withdraw-limits";
import { getWalletMinAmountCents } from "@/lib/wallet-config";
import { WITHDRAW_PAYMENT_OPTIONS } from "@/lib/payment-methods";
import { useWithdrawDestinations } from "@/hooks/use-withdraw-destinations";
import type { WithdrawMethod, WalletTransferResult } from "@/types/wallet";
import { Button } from "@/components/ui/button";
import { formatWalletAmount, formatWalletNumber } from "@/lib/utils";
import { CurrencyIcon } from "@/components/wallet/currency-icon";
import {
  MethodGlyph,
  WalletActionButton,
  WalletAmountInput,
  WalletBalanceField,
  WalletInlineInput,
  WalletMetaRow,
  WalletSelect,
} from "@/components/wallet/wallet-ui";

interface WithdrawFlowProps {
  onSuccess?: (result: WalletTransferResult) => void;
}

export function WithdrawFlow({ onSuccess }: WithdrawFlowProps) {
  const { user, refreshBalance } = useAuth();
  const { destinations, loading } = useWithdrawDestinations();
  const [amountInput, setAmountInput] = useState("0");
  const [method, setMethod] = useState<WithdrawMethod>("bank");
  const [payoutCurrency, setPayoutCurrency] = useState("USD");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankId, setBankId] = useState("khan");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<WalletTransferResult | null>(
    null
  );

  const paymentOptions = useMemo(() => {
    const enabledIds = new Set(
      destinations.methods.filter((item) => item.enabled).map((item) => item.id)
    );
    const filtered = WITHDRAW_PAYMENT_OPTIONS.filter((option) =>
      enabledIds.has(option.id)
    ).map((option) => ({
      ...option,
      label:
        destinations.methods.find((item) => item.id === option.id)?.label ||
        option.label,
    }));

    return filtered.length > 0 ? filtered : WITHDRAW_PAYMENT_OPTIONS;
  }, [destinations.methods]);

  const banks = destinations.banks.length > 0 ? destinations.banks : [];
  const currencies =
    destinations.currencies.length > 0 ? destinations.currencies : ["USD"];

  useEffect(() => {
    if (!paymentOptions.some((option) => option.id === method)) {
      setMethod(paymentOptions[0]?.id ?? "bank");
    }
  }, [method, paymentOptions]);

  useEffect(() => {
    if (!currencies.includes(payoutCurrency)) {
      setPayoutCurrency(currencies[0] ?? "USD");
    }
  }, [currencies, payoutCurrency]);

  useEffect(() => {
    if (banks.length > 0 && !banks.some((bank) => bank.id === bankId)) {
      setBankId(banks[0].id);
    }
  }, [bankId, banks]);

  const selectedMethod = paymentOptions.find((item) => item.id === method);
  const selectedBank = banks.find((bank) => bank.id === bankId) ?? banks[0];

  const nameDefault = user?.displayName || user?.username || "";

  const resolvedAccountName = accountName || nameDefault;
  const resolvedPaypal = paypalEmail || user?.email || "";

  const currency = user?.currency || DEFAULT_CURRENCY;
  const minAmountCents = getWalletMinAmountCents();
  const amountCents = parseWithdrawCents(
    amountInput === "0" ? "" : amountInput
  );
  const amount = parseWithdrawAmount(amountInput === "0" ? "" : amountInput);
  const exceedsBalance = Boolean(user && amountCents > user.balanceCents);
  const amountValid =
    Boolean(user) && amountCents >= minAmountCents && !exceedsBalance;

  const convertedLabel = useMemo(() => {
    if (amountCents <= 0) return "0";
    return formatWalletNumber(amountCents);
  }, [amountCents]);

  if (!user) return null;

  function setMax() {
    if (!user) return;
    setAmountInput(formatWalletNumber(user.balanceCents));
    setError("");
  }

  async function handleConfirm() {
    if (!user) return;
    setError("");

    if (amountCents <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }
    if (amountCents < minAmountCents) {
      setError(
        `Minimum withdrawal is ${formatWalletAmount(minAmountCents, currency)}.`
      );
      return;
    }
    if (exceedsBalance) {
      setError("Amount exceeds your available balance.");
      return;
    }
    if (method === "bank" && (!resolvedAccountName || !accountNumber)) {
      setError("Enter your account name and number.");
      return;
    }
    if (method === "crypto" && !cryptoAddress.trim()) {
      setError("Enter your crypto payout address.");
      return;
    }
    if (method === "paypal" && !resolvedPaypal.trim()) {
      setError("Enter your PayPal email.");
      return;
    }

    setProcessing(true);
    try {
      const result = await createWithdraw(user, {
        amount,
        currency: payoutCurrency || currency,
        destination: {
          method,
          accountName: method === "bank" ? resolvedAccountName : undefined,
          accountNumber: method === "bank" ? accountNumber : undefined,
          bankName: method === "bank" ? selectedBank?.label : undefined,
          cryptoAddress: method === "crypto" ? cryptoAddress.trim() : undefined,
          paypalEmail: method === "paypal" ? resolvedPaypal.trim() : undefined,
        },
      });
      if (result.status === "completed") {
        await refreshBalance();
      }
      setLastResult(result);
      onSuccess?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Withdrawal failed.");
    } finally {
      setProcessing(false);
    }
  }

  function resetFlow() {
    setAmountInput("0");
    setError("");
    setLastResult(null);
  }

  if (lastResult) {
    const pending = lastResult.status !== "completed";
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">
          {pending ? "Withdrawal submitted" : "Withdrawal complete"}
        </h2>
        <p className="mt-2 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            −
            {formatWalletAmount(
              Math.round(lastResult.transferAmount * 100),
              lastResult.currency
            )}
          </span>{" "}
          {pending
            ? "is waiting for review. Your balance is unchanged until approval."
            : "withdrawn from your balance"}
        </p>
        {lastResult.reference ? (
          <p className="mt-4 text-sm text-zinc-500">
            Reference:{" "}
            <span className="font-mono text-zinc-400">
              {lastResult.reference}
            </span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
        <p className="px-1 text-xs text-zinc-500">Loading withdrawal methods…</p>
      ) : null}

      <WalletMetaRow
        label={
          <span className="inline-flex items-center gap-1.5">
            Available to withdraw
            <Info className="h-3.5 w-3.5 text-zinc-500" />
          </span>
        }
        value={formatWalletNumber(user.balanceCents)}
        icon={<CurrencyIcon size="sm" />}
      />

      <WalletAmountInput
        id="withdraw-amount"
        label="Withdrawal amount"
        value={amountInput}
        onChange={(value) => {
          setAmountInput(value);
          setError("");
        }}
        trailing={
          <button
            type="button"
            onClick={setMax}
            className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200 hover:bg-white/15"
          >
            max
          </button>
        }
      />

      <WalletMetaRow
        label="Min. Amount"
        value={formatWalletNumber(minAmountCents)}
        icon={<CurrencyIcon size="sm" />}
      />

      <div className="grid grid-cols-[1fr_7.5rem] gap-2">
        <WalletInlineInput
          id="converted-amount"
          label="Converted Amount"
          value={convertedLabel}
          readOnly
        />
        <WalletSelect
          label="Currency"
          value={payoutCurrency}
          onChange={setPayoutCurrency}
          options={currencies.map((code) => ({
            id: code,
            label: code,
          }))}
        />
      </div>

      {method === "bank" ? (
        <>
          <WalletInlineInput
            id="account-name"
            label="Account name"
            value={resolvedAccountName}
            onChange={setAccountName}
          />
          <WalletInlineInput
            id="account-number"
            label="Account number"
            value={accountNumber}
            onChange={setAccountNumber}
            placeholder="Bank account number"
          />
          <WalletSelect
            label="Bank"
            value={bankId}
            onChange={setBankId}
            options={banks.map((bank) => ({
              id: bank.id,
              label: bank.label,
            }))}
          />
        </>
      ) : null}

      {method === "crypto" ? (
        <WalletInlineInput
          id="crypto-address"
          label="Payout address"
          value={cryptoAddress}
          onChange={setCryptoAddress}
          placeholder="0x..."
        />
      ) : null}

      {method === "paypal" ? (
        <WalletInlineInput
          id="paypal-payout"
          label="PayPal email"
          value={resolvedPaypal}
          onChange={setPaypalEmail}
        />
      ) : null}

      {exceedsBalance && amountCents > 0 ? (
        <p className="text-sm text-red-400">Exceeds available balance.</p>
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
        Submit withdrawal
      </WalletActionButton>
    </div>
  );
}
