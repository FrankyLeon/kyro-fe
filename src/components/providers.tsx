"use client";

import { AuthProvider } from "@/context/auth-context";
import { LogoutConfirmProvider } from "@/context/logout-confirm-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LogoutConfirmProvider>{children}</LogoutConfirmProvider>
    </AuthProvider>
  );
}
