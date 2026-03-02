"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  USER_STORAGE_EVENT,
  fetchSessionUser,
  isSameAuthUser,
  readLocalUser,
  writeLocalUser,
  type AuthUser,
} from "@/lib/auth/client";

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refresh: (options?: { force?: boolean; silent?: boolean }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Keep SSR and client first render consistent to avoid hydration mismatch.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }

    try {
      setError(null);
      const sessionUser = await fetchSessionUser({ force: options?.force });
      setUser((prev) => (isSameAuthUser(prev, sessionUser) ? prev : sessionUser));
      writeLocalUser(sessionUser, { emitEvent: false });
      return sessionUser;
    } catch (err) {
      console.error("AuthProvider refresh error:", err);
      const cached = readLocalUser();
      setUser((prev) => (isSameAuthUser(prev, cached) ? prev : cached));
      setError("Failed to validate session");
      return cached;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("AuthProvider logout error:", err);
    } finally {
      writeLocalUser(null, { emitEvent: false });
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh({ silent: false });
  }, [refresh]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "user") return;
      const nextUser = readLocalUser();
      setUser((prev) => (isSameAuthUser(prev, nextUser) ? prev : nextUser));
    };
    const onCustom = () => {
      const nextUser = readLocalUser();
      setUser((prev) => (isSameAuthUser(prev, nextUser) ? prev : nextUser));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(USER_STORAGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(USER_STORAGE_EVENT, onCustom);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      refresh,
      logout,
    }),
    [error, loading, logout, refresh, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
