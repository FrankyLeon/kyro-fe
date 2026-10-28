"use client";

import { AuthProvider } from "@/context/auth-context";
import { LocaleProvider } from "@/context/locale-context";
import { LogoutConfirmProvider } from "@/context/logout-confirm-context";
import { WalletMenuProvider } from "@/context/wallet-menu-context";
import type { Locale } from "@/i18n/locale";
import type { AppMessages } from "@/i18n/translate";

export function Providers({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: AppMessages;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider locale={locale} messages={messages}>
      <AuthProvider>
        <LogoutConfirmProvider>
          <WalletMenuProvider>{children}</WalletMenuProvider>
        </LogoutConfirmProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
