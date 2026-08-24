"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/context/auth-context";

interface LogoutConfirmContextValue {
  requestLogout: () => void;
}

const LogoutConfirmContext =
  createContext<LogoutConfirmContextValue | null>(null);

export function LogoutConfirmProvider({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const requestLogout = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    logout();
    router.push("/store");
    router.refresh();
  }, [logout, router]);

  return (
    <LogoutConfirmContext.Provider value={{ requestLogout }}>
      {children}
      <ConfirmDialog
        open={open}
        title="Sign out?"
        description="You'll need to sign in again to access your wallet, launch games, and view your account."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </LogoutConfirmContext.Provider>
  );
}

export function useLogoutConfirm() {
  const ctx = useContext(LogoutConfirmContext);
  if (!ctx) {
    throw new Error("useLogoutConfirm must be used within LogoutConfirmProvider");
  }
  return ctx;
}
