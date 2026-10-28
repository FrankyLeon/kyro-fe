"use client";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/locale-context";
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
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        {t("wallet.paypalHelp")}
      </div>
      <Input
        id="paypal-email"
        label={t("wallet.paypalEmail")}
        type="email"
        placeholder="you@email.com"
        value={value.email || defaultEmail || ""}
        onChange={(e) => onChange({ email: e.target.value })}
        autoComplete="email"
      />
    </div>
  );
}
