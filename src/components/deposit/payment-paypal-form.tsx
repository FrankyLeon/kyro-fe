"use client";

import { Input } from "@/components/ui/input";
import type { PayPalPaymentDetails } from "@/types/deposit";

interface PaymentPayPalFormProps {
  value: PayPalPaymentDetails;
  onChange: (value: PayPalPaymentDetails) => void;
  defaultEmail?: string;
}

export function PaymentPayPalForm({
  value,
  onChange,
  defaultEmail,
}: PaymentPayPalFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        Send the deposit to the operator PayPal account shown above, then
        confirm here. Your balance is credited after the payment is approved.
      </div>
      <Input
        id="paypal-email"
        label="PayPal email"
        type="email"
        placeholder="you@email.com"
        value={value.email || defaultEmail || ""}
        onChange={(e) => onChange({ email: e.target.value })}
        autoComplete="email"
      />
    </div>
  );
}
