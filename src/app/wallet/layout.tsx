import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet",
  description:
    "Deposit funds, withdraw winnings, and view your transaction history on Kyro.",
};

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
