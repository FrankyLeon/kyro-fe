"use client";

import { AuthProvider } from "@/context/auth-context";
import { LogoutConfirmProvider } from "@/context/logout-confirm-context";
import { WalletMenuProvider } from "@/context/wallet-menu-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LogoutConfirmProvider>
        <WalletMenuProvider>{children}</WalletMenuProvider>
      </LogoutConfirmProvider>
    </AuthProvider>
  );
}
