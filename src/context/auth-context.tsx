"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthSession, User } from "@/types";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBalance = useCallback(async () => {
    if (!authApi.getStoredSession()?.user) return;

    try {
      const updated = await refreshUserBalance();
      setUser(updated);
    } catch {
      // Keep the last known balance when sync fails.
    }
  }, []);

  useEffect(() => {
    const session = authApi.getStoredSession();
    setUser(session?.user ?? null);
    setIsLoading(false);

    if (session?.user) {
      void refreshBalance();
    }
  }, [refreshBalance]);

  const applySession = useCallback((session: AuthSession) => {
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authApi.login(email, password);
      applySession(session);
      await refreshBalance();
    },
    [applySession, refreshBalance]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      avatarUrl?: string
    ) => {
      const session = await authApi.register(
        email,
        password,
        displayName,
        avatarUrl
      );
      applySession(session);
      await refreshBalance();
    },
    [applySession, refreshBalance]
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
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
