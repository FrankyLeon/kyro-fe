"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { WalletMenu, type WalletMenuTab } from "@/components/wallet/wallet-menu";
import { useAuth } from "@/context/auth-context";

interface WalletMenuContextValue {
  openWallet: (tab?: WalletMenuTab) => void;
  closeWallet: () => void;
}

const WalletMenuContext = createContext<WalletMenuContextValue | null>(null);

export function WalletMenuProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<WalletMenuTab>("deposit");

  const openWallet = useCallback((nextTab: WalletMenuTab = "deposit") => {
    setTab(nextTab);
    setOpen(true);
  }, []);

  const closeWallet = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeWallet();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeWallet]);

  useEffect(() => {
    if (!user) setOpen(false);
  }, [user]);

  return (
    <WalletMenuContext.Provider value={{ openWallet, closeWallet }}>
      {children}
      {open && user ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close wallet menu"
            className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm"
            onClick={closeWallet}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-menu-title"
            className="relative dialog-pop-in"
          >
            <WalletMenu
              tab={tab}
              onTabChange={setTab}
              onClose={closeWallet}
            />
          </div>
        </div>
      ) : null}
    </WalletMenuContext.Provider>
  );
}

export function useWalletMenu() {
  const ctx = useContext(WalletMenuContext);
  if (!ctx) {
    throw new Error("useWalletMenu must be used within WalletMenuProvider");
  }
  return ctx;
}
