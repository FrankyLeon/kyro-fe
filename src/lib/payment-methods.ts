import type {
  CryptoCurrency,
  DepositDestinations,
  DepositMethod,
} from "@/types/deposit";
import type { WithdrawMethod } from "@/types/wallet";

export interface PaymentOption<T extends string = string> {
  id: T;
  label: string;
  hint?: string;
  icon: "bank" | "crypto" | "card" | "paypal";
}

export const DEPOSIT_PAYMENT_OPTIONS: PaymentOption<DepositMethod>[] = [
  { id: "bank", label: "Khan Bank", hint: "Local bank transfer", icon: "bank" },
  { id: "crypto", label: "USDT BEP20", hint: "Crypto deposit", icon: "crypto" },
  { id: "card", label: "Credit / Debit", hint: "Card payment", icon: "card" },
  { id: "paypal", label: "PayPal", hint: "PayPal checkout", icon: "paypal" },
];

export const WITHDRAW_PAYMENT_OPTIONS: PaymentOption<WithdrawMethod>[] = [
  { id: "bank", label: "Bank transfer", hint: "Payout to bank", icon: "bank" },
  { id: "crypto", label: "USDT BEP20", hint: "Crypto payout", icon: "crypto" },
  { id: "paypal", label: "PayPal", hint: "PayPal payout", icon: "paypal" },
];

export const DEPOSIT_BANKS = [
  { id: "khan", label: "Khan Bank" },
  { id: "golomt", label: "Golomt Bank" },
  { id: "tdb", label: "Trade and Development Bank" },
  { id: "xac", label: "XacBank" },
  { id: "state", label: "State Bank" },
] as const;

export const WITHDRAW_BANKS = DEPOSIT_BANKS;

export const BANK_DEPOSIT_ACCOUNT = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME?.trim() || "Khan Bank",
  accountNumber:
    process.env.NEXT_PUBLIC_BANK_ACCOUNT?.trim() || "810005005434250791",
  accountHolder:
    process.env.NEXT_PUBLIC_BANK_HOLDER?.trim() || "KYRO PAYMENTS",
};

export const BANK_DEPOSIT_INSTRUCTIONS = [
  "Deposit only from one account registered to this player.",
  "Transfers from a different account will not be eligible for withdrawal.",
  "Include your player name (username) in the transfer description.",
];

export const CRYPTO_NETWORKS: {
  id: CryptoCurrency;
  label: string;
  standard: string;
  network: string;
}[] = [
  { id: "USDT", label: "USDT.BEP20", standard: "BEP-20", network: "BNB Smart Chain" },
  { id: "USDC", label: "USDC.ERC20", standard: "ERC-20", network: "Ethereum" },
  { id: "ETH", label: "ETH", standard: "ERC-20", network: "Ethereum" },
  { id: "BTC", label: "BTC", standard: "Bitcoin", network: "Bitcoin" },
];

export const CRYPTO_DEPOSIT_ADDRESSES: Record<CryptoCurrency, string> = {
  USDT: "0xd91815101ac60b5577becedbce460cf8a1459b37",
  USDC: "0xKyro7a3b9c2d4e5f6DemoDeposit00",
  ETH: "0xKyro7a3b9c2d4e5f6DemoDeposit00",
  BTC: "bc1qkyro9x7k2m4demo8deposit0000",
};

export const WITHDRAW_CURRENCIES = ["USD", "MNT", "USDT"] as const;

export const FALLBACK_DEPOSIT_DESTINATIONS: DepositDestinations = {
  methods: DEPOSIT_PAYMENT_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    enabled: true,
  })),
  bank: {
    bankName: BANK_DEPOSIT_ACCOUNT.bankName,
    accountNumber: BANK_DEPOSIT_ACCOUNT.accountNumber,
    accountHolder: BANK_DEPOSIT_ACCOUNT.accountHolder,
    instructions: BANK_DEPOSIT_INSTRUCTIONS,
  },
  crypto: {
    networks: CRYPTO_NETWORKS.map((network) => ({
      ...network,
      address: CRYPTO_DEPOSIT_ADDRESSES[network.id],
    })),
  },
  paypal: {
    email: "",
    instructions: [],
  },
  card: {
    instructions: [],
  },
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(asString).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeDepositDestinations(
  raw: Partial<DepositDestinations> | null | undefined
): DepositDestinations {
  const fallback = FALLBACK_DEPOSIT_DESTINATIONS;
  if (!raw) return fallback;

  const methods = (raw.methods ?? fallback.methods).map((method) => ({
    id: method.id,
    label:
      asString(method.label) ||
      fallback.methods.find((item) => item.id === method.id)?.label ||
      method.id,
    enabled: method.enabled !== false,
  }));

  const remoteNetworks = raw.crypto?.networks ?? [];

  return {
    methods: methods.length > 0 ? methods : fallback.methods,
    bank: {
      bankName: asString(raw.bank?.bankName) || fallback.bank.bankName,
      accountNumber: asString(raw.bank?.accountNumber),
      accountHolder: asString(raw.bank?.accountHolder),
      instructions: asLines(raw.bank?.instructions),
    },
    crypto: {
      networks: (remoteNetworks.length > 0
        ? remoteNetworks
        : fallback.crypto.networks
      ).map((network) => ({
        id: network.id,
        label: asString(network.label) || network.id,
        standard: asString(network.standard),
        network: asString(network.network),
        address: asString(network.address),
      })),
    },
    paypal: {
      email: asString(raw.paypal?.email),
      instructions: asLines(raw.paypal?.instructions),
    },
    card: {
      instructions: asLines(raw.card?.instructions),
    },
  };
}
