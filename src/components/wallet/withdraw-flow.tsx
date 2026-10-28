"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createWithdraw } from "@/lib/api/wallet";
import { DEFAULT_CURRENCY } from "@/lib/deposit-packs";
import {
  parseWithdrawAmount,
  parseWithdrawCents,
} from "@/lib/withdraw-limits";
import { getWalletMinAmountCents } from "@/lib/wallet-config";
import { useI18n } from "@/context/locale-context";
import { bankDisplayName, paymentMethodLabel } from "@/i18n/labels";
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

function resolvePayoutCurrency(
  method: WithdrawMethod,
  currencies: string[],
  current: string
) {
  if (method === "crypto") {
    return currencies.includes("USDT") ? "USDT" : (currencies[0] ?? "USDT");
  }
  if (method === "bank") {
    if (current !== "USDT" && currencies.includes(current)) return current;
    if (currencies.includes("USD")) return "USD";
    return currencies.find((code) => code !== "USDT") ?? currencies[0] ?? "USD";
  }
  return currencies.includes(current) ? current : (currencies[0] ?? "USDT");
}

export function WithdrawFlow({ onSuccess }: WithdrawFlowProps) {
  const { t } = useI18n();
  const { user, refreshBalance } = useAuth();
  const { destinations } = useWithdrawDestinations();
  const [amountInput, setAmountInput] = useState("0");
  const [method, setMethod] = useState<WithdrawMethod>("bank");
  const [payoutCurrency, setPayoutCurrency] = useState("USDT");
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

  const banks = useMemo(
    () => (destinations.banks.length > 0 ? destinations.banks : []),
    [destinations.banks]
  );
  const currencies = useMemo(
    () =>
      destinations.currencies.length > 0 ? destinations.currencies : ["USDT"],
    [destinations.currencies]
  );

  const activeMethod = paymentOptions.some((option) => option.id === method)
    ? method
    : (paymentOptions[0]?.id ?? "crypto");
  if (activeMethod !== method) {
    setMethod(activeMethod);
  }

  const activeCurrency = resolvePayoutCurrency(
    activeMethod,
    currencies,
    payoutCurrency
  );
  if (activeCurrency !== payoutCurrency) {
    setPayoutCurrency(activeCurrency);
  }

  const activeBankId =
    banks.length === 0 || banks.some((bank) => bank.id === bankId)
      ? bankId
      : banks[0].id;
  if (activeBankId !== bankId) {
    setBankId(activeBankId);
  }

  const selectedMethod = paymentOptions.find((item) => item.id === activeMethod);
  const selectedBank = banks.find((bank) => bank.id === activeBankId) ?? banks[0];

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
      setError(t("wallet.invalidWithdraw"));
      return;
    }
    if (amountCents < minAmountCents) {
      setError(
        t("wallet.minWithdraw", {
          amount: formatWalletAmount(minAmountCents, currency),
        })
      );
      return;
    }
    if (exceedsBalance) {
      setError(t("wallet.exceedsBalance"));
      return;
    }
    if (activeMethod === "bank" && (!resolvedAccountName || !accountNumber)) {
      setError(t("wallet.bankDetailsRequired"));
      return;
    }
    if (activeMethod === "crypto" && !cryptoAddress.trim()) {
      setError(t("wallet.cryptoAddressRequired"));
      return;
    }
    if (activeMethod === "paypal" && !resolvedPaypal.trim()) {
      setError(t("wallet.paypalEmailRequired"));
      return;
    }

    setProcessing(true);
    try {
      const result = await createWithdraw(user, {
        amount,
        currency: activeCurrency || currency,
        destination: {
          method: activeMethod,
          accountName: activeMethod === "bank" ? resolvedAccountName : undefined,
          accountNumber: activeMethod === "bank" ? accountNumber : undefined,
          bankName: activeMethod === "bank" ? selectedBank?.label : undefined,
          cryptoAddress:
            activeMethod === "crypto" ? cryptoAddress.trim() : undefined,
          paypalEmail: activeMethod === "paypal" ? resolvedPaypal.trim() : undefined,
        },
      });
      if (result.status === "completed") {
        await refreshBalance();
      }
      setLastResult(result);
      onSuccess?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("wallet.withdrawFailed"));
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
          {pending ? t("wallet.withdrawSubmitted") : t("wallet.withdrawComplete")}
        </h2>
        <p className="mt-2 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            {formatWalletAmount(
              Math.round((lastResult.transferAmount || amount) * 100),
              lastResult.currency
            )}
          </span>{" "}
          {pending ? t("wallet.withdrawPending") : t("wallet.withdrawAdded")}
        </p>
        {lastResult.txHash ? (
          <p className="mt-4 text-sm text-zinc-500">
            {t("wallet.tx")}{" "}
            <span className="font-mono text-zinc-400">{lastResult.txHash}</span>
          </p>
        ) : lastResult.reference ? (
          <p className="mt-4 text-sm text-zinc-500">
            {t("wallet.reference")}{" "}
            <span className="font-mono text-zinc-400">
              {lastResult.reference}
            </span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={resetFlow} variant="secondary">
            {t("wallet.anotherWithdraw")}
          </Button>
          <a href="/account">
            <Button>{t("wallet.viewAccount")}</Button>
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
        label={t("wallet.paymentMethod")}
        value={activeMethod}
        onChange={setMethod}
        icon={<MethodGlyph kind={selectedMethod?.icon ?? "bank"} />}
        options={paymentOptions.map((option) => ({
          id: option.id,
          label: paymentMethodLabel(t, option.id, option.label),
          icon: <MethodGlyph kind={option.icon} />,
        }))}
      />

      <WalletMetaRow
        label={
          <span className="inline-flex items-center gap-1.5">
            {t("wallet.available")}
            <Info className="h-3.5 w-3.5 text-zinc-500" />
          </span>
        }
        value={formatWalletNumber(user.balanceCents)}
        icon={<CurrencyIcon size="sm" />}
      />

      <WalletAmountInput
        id="withdraw-amount"
        label={t("wallet.withdrawAmount")}
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
            {t("wallet.max")}
          </button>
        }
      />

      <WalletMetaRow
        label={t("wallet.minAmount")}
        value={formatWalletNumber(minAmountCents)}
        icon={<CurrencyIcon size="sm" />}
      />

      <div className="grid grid-cols-[1fr_7.5rem] gap-2">
        <WalletInlineInput
          id="converted-amount"
          label={t("wallet.converted")}
          value={convertedLabel}
          readOnly
        />
        <WalletSelect
          label={t("wallet.currency")}
          value={activeCurrency}
          onChange={setPayoutCurrency}
          options={currencies.map((code) => ({
            id: code,
            label: code,
          }))}
        />
      </div>

      {activeMethod === "bank" ? (
        <>
          <WalletInlineInput
            id="account-name"
            label={t("wallet.accountName")}
            value={resolvedAccountName}
            onChange={setAccountName}
          />
          <WalletInlineInput
            id="account-number"
            label={t("wallet.accountNumber")}
            value={accountNumber}
            onChange={setAccountNumber}
            placeholder={t("wallet.bankAccountPlaceholder")}
          />
          <WalletSelect
            label={t("wallet.bank")}
            value={activeBankId}
            onChange={setBankId}
            options={banks.map((bank) => ({
              id: bank.id,
              label: bankDisplayName(t, bank.id, bank.label),
            }))}
          />
        </>
      ) : null}

      {activeMethod === "crypto" ? (
        <WalletInlineInput
          id="crypto-address"
          label={t("wallet.payoutAddress")}
          value={cryptoAddress}
          onChange={setCryptoAddress}
          placeholder="0x..."
        />
      ) : null}

      {activeMethod === "paypal" ? (
        <WalletInlineInput
          id="paypal-payout"
          label={t("wallet.paypalEmail")}
          value={resolvedPaypal}
          onChange={setPaypalEmail}
        />
      ) : null}

      {exceedsBalance && amountCents > 0 ? (
        <p className="text-sm text-red-400">{t("wallet.exceedsAvailable")}</p>
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
        {t("wallet.submitWithdraw")}
      </WalletActionButton>
    </div>
  );
}
