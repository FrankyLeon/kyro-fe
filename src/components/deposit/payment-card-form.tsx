"use client";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/locale-context";
import type { CardPaymentDetails } from "@/types/deposit";

interface PaymentCardFormProps {
  value: CardPaymentDetails;
  onChange: (value: CardPaymentDetails) => void;
}

export function PaymentCardForm({ value, onChange }: PaymentCardFormProps) {
  const { t } = useI18n();
  function formatCardNumber(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function formatExpiry(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return (
    <div className="space-y-4">
      <Input
        id="cardholder"
        label={t("wallet.cardholder")}
        placeholder={t("wallet.cardholderPlaceholder")}
        value={value.cardholderName}
        onChange={(e) =>
          onChange({ ...value, cardholderName: e.target.value })
        }
        autoComplete="cc-name"
      />
      <Input
        id="cardnumber"
        label={t("wallet.cardNumber")}
        placeholder="4242 4242 4242 4242"
        value={value.cardNumber}
        onChange={(e) =>
          onChange({ ...value, cardNumber: formatCardNumber(e.target.value) })
        }
        autoComplete="cc-number"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="expiry"
          label={t("wallet.expiry")}
          placeholder="MM/YY"
          value={value.expiry}
          onChange={(e) =>
            onChange({ ...value, expiry: formatExpiry(e.target.value) })
          }
          autoComplete="cc-exp"
        />
        <Input
          id="cvc"
          label="CVC"
          placeholder="123"
          type="password"
          maxLength={4}
          value={value.cvc}
          onChange={(e) =>
            onChange({
              ...value,
              cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
            })
          }
          autoComplete="cc-csc"
        />
      </div>
      <p className="text-xs text-zinc-600">
        {t("wallet.cardSecure")}
      </p>
    </div>
  );
}
