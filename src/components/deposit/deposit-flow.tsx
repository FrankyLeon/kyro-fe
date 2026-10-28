"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createDeposit } from "@/lib/api/deposit";
import {
  bep20ExplorerTxUrl,
  normalizeBep20TxHash,
  shortenTxHash,
} from "@/lib/bep20-tx-hash";
import {
  DEFAULT_CURRENCY,
  parseCustomDepositCents,
} from "@/lib/deposit-packs";
import { getWalletMinAmountCents } from "@/lib/wallet-config";
import { useI18n } from "@/context/locale-context";
import {
  bankDisplayName,
  paymentMethodLabel,
  translateInstruction,
} from "@/i18n/labels";
import {
  DEPOSIT_BANKS,
  DEPOSIT_PAYMENT_OPTIONS,
} from "@/lib/payment-methods";
import { useDepositDestinations } from "@/hooks/use-deposit-destinations";
import type {
  DepositMethod,
  CardPaymentDetails,
  PayPalPaymentDetails,
  CryptoPaymentDetails,
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
  WalletInlineInput,
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

function makeBankReference(username: string) {
  const base =
    username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase() ||
    "PLAYER";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

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
  const { t } = useI18n();
  const { user, refreshBalance } = useAuth();
  const { destinations } = useDepositDestinations();
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<DepositMethod>("bank");
  const [card, setCard] = useState<CardPaymentDetails>(emptyCard);
  const [paypal, setPaypal] = useState<PayPalPaymentDetails>({ email: "" });
  const [crypto, setCrypto] = useState<CryptoPaymentDetails>({
    currency: "USDT",
  });
  const [senderBankId, setSenderBankId] = useState<
    (typeof DEPOSIT_BANKS)[number]["id"]
  >("khan");
  const [senderName, setSenderName] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [bankReference, setBankReference] = useState("");
  const [referenceOwner, setReferenceOwner] = useState("");
  const [pastedTxHash, setPastedTxHash] = useState("");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
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
    const usdtNetworks = destinations.crypto.networks.filter(
      (network) => network.id === "USDT"
    );
    const withAddress = usdtNetworks.filter((network) => network.address);
    return withAddress.length > 0 ? withAddress : usdtNetworks;
  }, [destinations.crypto.networks]);

  const activeMethod = paymentOptions.some((option) => option.id === method)
    ? method
    : (paymentOptions[0]?.id ?? "crypto");
  if (activeMethod !== method) {
    setMethod(activeMethod);
  }

  const activeCryptoCurrency = cryptoNetworks.some(
    (network) => network.id === crypto.currency
  )
    ? crypto.currency
    : (cryptoNetworks[0]?.id ?? crypto.currency);
  if (activeCryptoCurrency !== crypto.currency) {
    setCrypto({ currency: activeCryptoCurrency });
  }

  const nextReferenceOwner = user?.username || user?.displayName || "";
  if (
    nextReferenceOwner &&
    !bankReference &&
    referenceOwner !== nextReferenceOwner
  ) {
    setReferenceOwner(nextReferenceOwner);
    setBankReference(makeBankReference(nextReferenceOwner));
  }

  if (!user) return null;

  const currency = user.currency || DEFAULT_CURRENCY;
  const minAmountCents = getWalletMinAmountCents();
  const amountCents = parseCustomDepositCents(customAmount);
  const amountValid = amountCents >= minAmountCents;
  const selectedMethod =
    paymentOptions.find((item) => item.id === activeMethod) ?? paymentOptions[0];
  const selectedNetwork =
    cryptoNetworks.find((network) => network.id === activeCryptoCurrency) ??
    cryptoNetworks[0];
  const cryptoAddress = selectedNetwork?.address ?? "";
  const pastedHash = normalizeBep20TxHash(pastedTxHash);
  const senderBank =
    DEPOSIT_BANKS.find((bank) => bank.id === senderBankId) ?? DEPOSIT_BANKS[0];
  const resolvedSenderName =
    senderName || user.displayName || user.username || "";
  const senderAccountDigits = senderAccount.replace(/\s+/g, "");
  const bankReady = Boolean(
    destinations.bank.accountNumber &&
      resolvedSenderName.trim() &&
      senderAccountDigits.length >= 6 &&
      bankReference
  );

  async function handleConfirm() {
    if (!user) return;
    setError("");
    setStatus("");

    if (amountCents <= 0) {
      setError(t("wallet.invalidDeposit"));
      return;
    }
    if (amountCents < minAmountCents) {
      setError(
        t("wallet.minDeposit", {
          amount: formatWalletAmount(minAmountCents, currency),
        })
      );
      return;
    }
    if (activeMethod === "bank" && !destinations.bank.accountNumber) {
      setError(t("wallet.bankNotConfigured"));
      return;
    }
    if (activeMethod === "bank" && !resolvedSenderName.trim()) {
      setError(t("wallet.senderNameRequired"));
      return;
    }
    if (activeMethod === "bank" && senderAccountDigits.length < 6) {
      setError(t("wallet.senderAccountRequired"));
      return;
    }
    if (activeMethod === "bank" && !bankReference) {
      setError(t("wallet.referenceMissing"));
      return;
    }
    if (activeMethod === "crypto" && !cryptoAddress) {
      setError(t("wallet.cryptoNotConfigured"));
      return;
    }
    if (activeMethod === "crypto" && !pastedHash) {
      setError(t("wallet.txHashRequired"));
      return;
    }
    if (activeMethod === "card") {
      const digits = card.cardNumber.replace(/\D/g, "");
      if (!card.cardholderName.trim() || digits.length < 13 || !card.expiry || card.cvc.length < 3) {
        setError(t("wallet.cardIncomplete"));
        return;
      }
    }
    if (activeMethod === "paypal") {
      const email = paypal.email.trim() || user.email;
      if (!email) {
        setError(t("wallet.paypalEmailRequired"));
        return;
      }
      if (!destinations.paypal.email) {
        setError(t("wallet.paypalNotConfigured"));
        return;
      }
    }

    setProcessing(true);
    try {
      const txHash = activeMethod === "crypto" ? pastedHash : "";

      if (activeMethod === "crypto") {
        setStatus(t("wallet.verifying", { hash: shortenTxHash(txHash) }));
      }

      const result = await createDeposit(user, {
        userId: user.id,
        amountCents,
        currency,
        method: activeMethod,
        txHash: txHash || undefined,
        card: activeMethod === "card" ? card : undefined,
        paypal:
          activeMethod === "paypal"
            ? { email: paypal.email.trim() || user.email }
            : undefined,
        crypto:
          activeMethod === "crypto"
            ? {
                ...crypto,
                currency: activeCryptoCurrency,
                txHash: txHash || undefined,
              }
            : undefined,
        bank:
          activeMethod === "bank"
            ? {
                bankId: senderBank.id,
                bankName: senderBank.label,
                accountName: resolvedSenderName.trim(),
                accountNumber: senderAccountDigits,
                reference: bankReference,
              }
            : undefined,
      });
      await refreshBalance();
      setLastTx(result.transaction);
      onSuccess?.(result.transaction);
      setCard(emptyCard);
      setPastedTxHash("");
      setStatus("");
    } catch (e) {
      setStatus("");
      setError(e instanceof Error ? e.message : t("wallet.depositFailed"));
    } finally {
      setProcessing(false);
    }
  }

  function resetFlow() {
    setError("");
    setStatus("");
    setLastTx(null);
    setCustomAmount("");
    setPastedTxHash("");
    setSenderAccount("");
    setBankReference(
      makeBankReference(user?.username || user?.displayName || "PLAYER")
    );
  }

  if (lastTx) {
    const pending = lastTx.status === "pending";
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">
          {pending ? t("wallet.depositSubmitted") : t("wallet.depositComplete")}
        </h2>
        <p className="mt-2 text-zinc-400">
          <span className="font-semibold text-white">
            +{formatWalletAmount(lastTx.amountCents, lastTx.currency)}
          </span>{" "}
          {pending ? t("wallet.depositPending") : t("wallet.depositAdded")}
        </p>
        {lastTx.txHash ? (
          <p className="mt-4 text-sm text-zinc-500">
            {t("wallet.tx")}{" "}
            <a
              href={bep20ExplorerTxUrl(lastTx.txHash)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-zinc-300 underline-offset-2 hover:text-white hover:underline"
            >
              {shortenTxHash(lastTx.txHash)}
            </a>
          </p>
        ) : lastTx.reference ? (
          <p className="mt-4 text-sm text-zinc-500">
            {t("wallet.reference")}{" "}
            <span className="font-mono text-zinc-400">{lastTx.reference}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={resetFlow} variant="secondary">
            {t("wallet.anotherDeposit")}
          </Button>
          <a href="/store">
            <Button>{t("cta.playNow")}</Button>
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

      {activeMethod === "bank" ? (
        <>
          <InstructionBlock
            lines={destinations.bank.instructions.map((line) =>
              translateInstruction(t, line)
            )}
          />
          {destinations.bank.accountNumber ? (
            <>
              <WalletCopyField
                label={t("wallet.bank")}
                value={bankDisplayName(
                  t,
                  undefined,
                  destinations.bank.bankName || "Khan Bank"
                )}
              />
              <WalletCopyField
                label={t("wallet.accountNumber")}
                value={destinations.bank.accountNumber}
              />
              {destinations.bank.accountHolder ? (
                <WalletCopyField
                  label={t("wallet.accountHolder")}
                  value={destinations.bank.accountHolder}
                />
              ) : null}
              {bankReference ? (
                <WalletCopyField
                  label={t("wallet.transferDescription")}
                  value={bankReference}
                />
              ) : null}
            </>
          ) : (
            <MissingDestination message={t("wallet.bankNotConfigured")} />
          )}
        </>
      ) : null}

      {activeMethod === "crypto" ? (
        <>
          {cryptoAddress ? (
            <>
              <div className="py-2">
                <QrCodeImage value={cryptoAddress} />
              </div>
              <WalletCopyField label={t("wallet.cryptoAddress")} value={cryptoAddress} />
            </>
          ) : (
            <MissingDestination message={t("wallet.cryptoNotConfigured")} />
          )}
          <WalletInlineInput
            id="crypto-txhash"
            label={t("wallet.txHash")}
            value={pastedTxHash}
            onChange={(value) => {
              setPastedTxHash(value);
              setError("");
            }}
            placeholder="0x…"
          />
          <WalletMetaRow
            label={t("wallet.minAmount")}
            value={formatWalletNumber(minAmountCents)}
            icon={<CurrencyIcon size="sm" />}
          />
        </>
      ) : null}

      {activeMethod === "card" ? (
        <div className="space-y-3">
          <InstructionBlock
            lines={destinations.card.instructions.map((line) =>
              translateInstruction(t, line)
            )}
          />
          <div className="rounded-xl border border-white/8 bg-[#1c1e28] p-4">
            <PaymentCardForm value={card} onChange={setCard} />
          </div>
        </div>
      ) : null}

      {activeMethod === "paypal" ? (
        <div className="space-y-3">
          <InstructionBlock
            lines={destinations.paypal.instructions.map((line) =>
              translateInstruction(t, line)
            )}
          />
          {destinations.paypal.email ? (
            <WalletCopyField
              label={t("wallet.paypalAccount")}
              value={destinations.paypal.email}
            />
          ) : (
            <MissingDestination message={t("wallet.paypalNotConfigured")} />
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
        label={t("wallet.depositAmount")}
        value={customAmount || "0"}
        onChange={(value) => {
          setCustomAmount(value === "0" ? "" : value);
          setError("");
        }}
      />

      {activeMethod !== "crypto" ? (
        <WalletMetaRow
          label={t("wallet.minAmount")}
          value={formatWalletNumber(minAmountCents)}
          icon={<CurrencyIcon size="sm" />}
        />
      ) : null}

      {activeMethod === "bank" && destinations.bank.accountNumber ? (
        <>
          <WalletSelect
            label={t("wallet.yourBank")}
            value={senderBankId}
            onChange={setSenderBankId}
            options={DEPOSIT_BANKS.map((bank) => ({
              id: bank.id,
              label: bankDisplayName(t, bank.id, bank.label),
            }))}
          />
          <WalletInlineInput
            id="sender-name"
            label={t("wallet.yourAccountName")}
            value={resolvedSenderName}
            onChange={setSenderName}
          />
          <WalletInlineInput
            id="sender-account"
            label={t("wallet.yourAccountNumber")}
            value={senderAccount}
            onChange={(value) => {
              setSenderAccount(value);
              setError("");
            }}
            placeholder={t("wallet.accountYouSentFrom")}
          />
          <p className="flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-zinc-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("wallet.bankNote")}
          </p>
        </>
      ) : null}

      {status ? (
        <p className="px-1 text-sm text-zinc-400">{status}</p>
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
        disabled={
          !amountValid ||
          (activeMethod === "crypto" && !pastedHash) ||
          (activeMethod === "bank" && !bankReady)
        }
      >
        {activeMethod === "card"
          ? t("wallet.submitDeposit")
          : activeMethod === "crypto"
            ? t("wallet.creditDeposit")
            : t("wallet.sentPayment")}
      </WalletActionButton>
    </div>
  );
}
