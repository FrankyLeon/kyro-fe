"use client";

import { Input } from "@/components/ui/input";
import type { CardPaymentDetails } from "@/types/deposit";

interface PaymentCardFormProps {
  value: CardPaymentDetails;
  onChange: (value: CardPaymentDetails) => void;
}

export function PaymentCardForm({ value, onChange }: PaymentCardFormProps) {
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
        label="Cardholder name"
        placeholder="As shown on card"
        value={value.cardholderName}
        onChange={(e) =>
          onChange({ ...value, cardholderName: e.target.value })
        }
        autoComplete="cc-name"
      />
      <Input
        id="cardnumber"
        label="Card number"
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
          label="Expiry"
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
        Your payment details are encrypted and processed securely.
      </p>
    </div>
  );
}
