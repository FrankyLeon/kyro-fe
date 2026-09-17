/**
 * Platform wallet transfer contract
 * (`/v1/player/wallet/deposit` | `/v1/player/wallet/withdraw`).
 */

/** Request body sent to the platform wallet endpoints. */
export interface WalletTransferRequest {
  playerExternalId: string;
  currency: string;
  amount: number;
}

/** `data` payload from a successful wallet transfer response. */
export interface WalletTransferData {
  currency: string;
  balance: number;
  depositAmount?: number;
  withdrawAmount?: number;
}

/** Normalized wallet transfer result used across the app. */
export interface WalletTransferResult {
  currency: string;
  balance: number;
  /** Amount deposited or withdrawn in this transaction. */
  transferAmount: number;
  status: TransactionStatus;
  reference?: string;
}

export type WithdrawMethod = "bank" | "crypto" | "paypal";

export interface WithdrawDestination {
  method: WithdrawMethod;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  cryptoAddress?: string;
  paypalEmail?: string;
}

export interface CreateWithdrawInput {
  userId: string;
  amount: number;
  currency?: string;
  destination?: WithdrawDestination;
}

export type TransactionType = "deposit" | "withdraw";

export type TransactionStatus = "pending" | "completed" | "failed" | "rejected";

export interface WithdrawMethodOption {
  id: WithdrawMethod;
  label: string;
  enabled: boolean;
}

export interface WithdrawBankOption {
  id: string;
  label: string;
}

export interface WithdrawDestinations {
  methods: WithdrawMethodOption[];
  banks: WithdrawBankOption[];
  currencies: string[];
}

/** Normalized wallet transaction from `GET /wallet/transactions`. */
export interface TransactionRecord {
  id: string;
  userId: string;
  type: TransactionType;
  amountCents: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  reference?: string;
}
