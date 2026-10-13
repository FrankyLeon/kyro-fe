"use client";

import { useEffect, useMemo, useState } from "react";
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
import { SITE_CTA } from "@/lib/site-copy";
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

  useEffect(() => {
    if (!paymentOptions.some((option) => option.id === method)) {
      setMethod(paymentOptions[0]?.id ?? "crypto");
    }
  }, [method, paymentOptions]);

  useEffect(() => {
    if (!cryptoNetworks.some((network) => network.id === crypto.currency)) {
      const next = cryptoNetworks[0]?.id;
      if (next) setCrypto({ currency: next });
    }
  }, [crypto.currency, cryptoNetworks]);

  useEffect(() => {
    if (user && !bankReference) {
      setBankReference(makeBankReference(user.username || user.displayName));
    }
  }, [user, bankReference]);

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
  const pastedHash = normalizeBep20TxHash(pastedTxHash);
  const senderBank =
    DEPOSIT_BANKS.find((bank) => bank.id === senderBankId) ?? DEPOSIT_BANKS[0];
  const resolvedSenderName = senderName || user.displayName || user.username;
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
    if (method === "bank" && !resolvedSenderName.trim()) {
      setError("Enter the name on the account you transferred from.");
      return;
    }
    if (method === "bank" && senderAccountDigits.length < 6) {
      setError("Enter the account number you transferred from.");
      return;
    }
    if (method === "bank" && !bankReference) {
      setError("Transfer description is missing. Refresh and try again.");
      return;
    }
    if (method === "crypto" && !cryptoAddress) {
      setError("Crypto deposit addresses are not configured yet.");
      return;
    }
    if (method === "crypto" && !pastedHash) {
      setError("Paste the BNB Smart Chain transaction hash after you send USDT.");
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
      const txHash = method === "crypto" ? pastedHash : "";

      if (method === "crypto") {
        setStatus(`Verifying ${shortenTxHash(txHash)} …`);
      }

      const result = await createDeposit(user, {
        userId: user.id,
        amountCents,
        currency,
        method,
        txHash: txHash || undefined,
        card: method === "card" ? card : undefined,
        paypal:
          method === "paypal"
            ? { email: paypal.email.trim() || user.email }
            : undefined,
        crypto:
          method === "crypto"
            ? { ...crypto, txHash: txHash || undefined }
            : undefined,
        bank:
          method === "bank"
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
      setError(e instanceof Error ? e.message : "Deposit failed");
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
        {lastTx.txHash ? (
          <p className="mt-4 text-sm text-zinc-500">
            Tx:{" "}
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

      {method === "bank" ? (
        <>
          <InstructionBlock lines={destinations.bank.instructions} />
          {destinations.bank.accountNumber ? (
            <>
              <WalletCopyField
                label="Bank"
                value={destinations.bank.bankName || "Khan Bank"}
              />
              <WalletCopyField
                label="Account number"
                value={destinations.bank.accountNumber}
              />
              {destinations.bank.accountHolder ? (
                <WalletCopyField
                  label="Account holder"
                  value={destinations.bank.accountHolder}
                />
              ) : null}
              {bankReference ? (
                <WalletCopyField
                  label="Transfer description"
                  value={bankReference}
                />
              ) : null}
            </>
          ) : (
            <MissingDestination message="Bank deposit details are not configured yet." />
          )}
        </>
      ) : null}

      {method === "crypto" ? (
        <>
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
          <WalletInlineInput
            id="crypto-txhash"
            label="Transaction hash"
            value={pastedTxHash}
            onChange={(value) => {
              setPastedTxHash(value);
              setError("");
            }}
            placeholder="0x…"
          />
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

      {method === "bank" && destinations.bank.accountNumber ? (
        <>
          <WalletSelect
            label="Your bank"
            value={senderBankId}
            onChange={setSenderBankId}
            options={DEPOSIT_BANKS.map((bank) => ({
              id: bank.id,
              label: bank.label,
            }))}
          />
          <WalletInlineInput
            id="sender-name"
            label="Your account name"
            value={resolvedSenderName}
            onChange={setSenderName}
          />
          <WalletInlineInput
            id="sender-account"
            label="Your account number"
            value={senderAccount}
            onChange={(value) => {
              setSenderAccount(value);
              setError("");
            }}
            placeholder="Account you sent from"
          />
          <p className="flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-zinc-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Send the amount from your bank app to the account above. Put the
            transfer description in the payment note. Your balance is credited
            after the transfer is approved in wp-admin.
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
          (method === "crypto" && !pastedHash) ||
          (method === "bank" && !bankReady)
        }
      >
        {method === "card"
          ? "Submit deposit"
          : method === "crypto"
            ? "Credit deposit"
            : "I sent the payment"}
      </WalletActionButton>
    </div>
  );
}
