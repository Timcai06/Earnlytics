"use client";

import { useEffect, useMemo, useState } from "react";
import {
  USER_STORAGE_EVENT,
  fetchSessionUser,
  isSameAuthUser,
  readLocalUser,
  writeLocalUser,
  type AuthUser,
} from "@/lib/auth/client";
import { useOptionalAuth } from "@/lib/auth/context";

function useLegacyAuthUser(enabled: boolean) {
  // Avoid reading localStorage during initial render to keep hydration stable.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      try {
        setError(null);
        const sessionUser = await fetchSessionUser();
        if (cancelled) return;
        setUser((prev) => (isSameAuthUser(prev, sessionUser) ? prev : sessionUser));
        writeLocalUser(sessionUser);
      } catch (err) {
        if (cancelled) return;
        console.error("useAuthUser legacy refresh error:", err);
        const cached = readLocalUser();
        setUser((prev) => (isSameAuthUser(prev, cached) ? prev : cached));
        setError("Failed to validate session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void refresh();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  return useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    }),
    [error, loading, user]
  );
}

export function useAuthUser() {
  const context = useOptionalAuth();
  const legacy = useLegacyAuthUser(!context);
  return context ?? legacy;
}
