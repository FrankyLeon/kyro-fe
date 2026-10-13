"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { User } from "@/types";
import * as authApi from "@/lib/api/auth";
import { refreshUserBalance } from "@/lib/api/player";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    avatarUrl?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeClientReady() {
  return () => {};
}

function getClientReadySnapshot() {
  return true;
}

function getServerReadySnapshot() {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getServerReadySnapshot
  );
  const storedUser = useSyncExternalStore(
    authApi.subscribeStoredSession,
    authApi.getStoredUserSnapshot,
    authApi.getServerUserSnapshot
  );
  const user = isClient ? storedUser : null;
  const isLoading = !isClient;
  const refreshed = useRef(false);

  const refreshBalance = useCallback(async () => {
    if (!authApi.getStoredSession()?.user) return;

    try {
      await refreshUserBalance();
    } catch {
      // Keep the last known balance when sync fails.
    }
  }, []);

  useEffect(() => {
    if (!isClient || refreshed.current) return;
    refreshed.current = true;
    if (authApi.getStoredSession()?.user) {
      void refreshBalance();
    }
  }, [isClient, refreshBalance]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login(email, password);
      await refreshBalance();
    },
    [refreshBalance]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      avatarUrl?: string
    ) => {
      await authApi.register(email, password, displayName, avatarUrl);
      await refreshBalance();
    },
    [refreshBalance]
  );

  const logout = useCallback(() => {
    authApi.logout();
  }, []);

  const updateUser = useCallback((u: User) => {
    authApi.updateStoredUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
