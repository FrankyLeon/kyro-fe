export type DepositMethod = "bank" | "card" | "paypal" | "crypto";

export type CryptoCurrency = "USDT" | "USDC" | "BTC" | "ETH";

export type DepositStatus = "pending" | "completed" | "failed";

export interface DepositPack {
  id: string;
  priceCents: number;
  label: string;
  popular?: boolean;
}

export interface DepositRecord {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
  priceCents: number;
  method: DepositMethod;
  status: DepositStatus;
  createdAt: string;
  reference?: string;
  txHash?: string;
  from?: string;
}

export interface CardPaymentDetails {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export interface PayPalPaymentDetails {
  email: string;
}

export interface CryptoPaymentDetails {
  currency: CryptoCurrency;
  txHash?: string;
}

export interface CreateDepositInput {
  userId: string;
  amountCents: number;
  currency?: string;
  method: DepositMethod;
  txHash?: string;
  from?: string;
  card?: CardPaymentDetails;
  paypal?: PayPalPaymentDetails;
  crypto?: CryptoPaymentDetails;
}

import type { User } from "@/types";

export interface DepositResult {
  user: User;
  transaction: DepositRecord;
}

export interface DepositMethodOption {
  id: DepositMethod;
  label: string;
  enabled: boolean;
}

export interface BankDepositDestination {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  instructions: string[];
}

export interface CryptoDepositNetwork {
  id: CryptoCurrency;
  label: string;
  standard: string;
  network: string;
  address: string;
}

export interface PaypalDepositDestination {
  email: string;
  instructions: string[];
}

export interface CardDepositDestination {
  instructions: string[];
}

export interface CryptoDepositSettings {
  networks: CryptoDepositNetwork[];
}

export interface DepositDestinations {
  methods: DepositMethodOption[];
  bank: BankDepositDestination;
  crypto: CryptoDepositSettings;
  paypal: PaypalDepositDestination;
  card: CardDepositDestination;
}
