import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "View your Kyro profile, wallet balance, and account settings.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
