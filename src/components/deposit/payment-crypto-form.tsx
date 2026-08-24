"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CryptoCurrency, CryptoPaymentDetails } from "@/types/deposit";

const currencies: { id: CryptoCurrency; label: string; network: string }[] = [
  { id: "USDT", label: "Tether", network: "BEP-20" },
  { id: "BTC", label: "Bitcoin", network: "Bitcoin" },
  { id: "ETH", label: "Ethereum", network: "ERC-20" },
  { id: "USDC", label: "USD Coin", network: "ERC-20" },
];

interface PaymentCryptoFormProps {
  value: CryptoPaymentDetails;
  onChange: (value: CryptoPaymentDetails) => void;
  priceCents: number;
}

const CRYPTO_PLACEHOLDER_ADDRESSES: Record<CryptoCurrency, string> = {
  USDT: "0xd91815101ac60b5577becedbce460cf8a1459b37",
  BTC: "bc1qkyro9x7k2m4demo8deposit0000",
  ETH: "0xKyro7a3b9c2d4e5f6DemoDeposit00",
  USDC: "0xKyro7a3b9c2d4e5f6DemoDeposit00",
};

export function PaymentCryptoForm({
  value,
  onChange,
  priceCents,
}: PaymentCryptoFormProps) {
  const [copied, setCopied] = useState(false);
  const address = CRYPTO_PLACEHOLDER_ADDRESSES[value.currency];
  const usd = (priceCents / 100).toFixed(2);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-zinc-300">Select currency</p>
      <div className="flex flex-wrap gap-2">
        {currencies.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange({ currency: c.id })}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              value.currency === c.id
                ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Amount due</span>
          <span className="font-semibold text-amber-400">${usd} USD</span>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">
            Send to this address ({currencies.find((c) => c.id === value.currency)?.network})
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-950 border border-zinc-800 p-3">
            <code className="flex-1 text-xs text-zinc-300 break-all">{address}</code>
            <button
              type="button"
              onClick={copyAddress}
              className="shrink-0 p-2 text-zinc-400 hover:text-amber-400"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="aspect-square max-w-[140px] mx-auto rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-600 text-center p-2">
          QR code
        </div>
        <p className="text-xs text-zinc-600 text-center">
          Scan the QR code or copy the address above. After sending, confirm
          below to credit your balance.
        </p>
      </div>
    </div>
  );
}
