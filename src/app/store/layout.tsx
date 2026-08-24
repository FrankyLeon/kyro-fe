import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Browse Kyro games by provider. Sign in, fund your wallet, and play instantly in your browser.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
