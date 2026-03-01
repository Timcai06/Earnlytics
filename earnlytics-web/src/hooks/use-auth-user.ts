"use client";

import { useEffect, useMemo, useState } from "react";
import {
  USER_STORAGE_EVENT,
  fetchSessionUser,
  readLocalUser,
  writeLocalUser,
  type AuthUser,
} from "@/lib/auth/client";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(() => readLocalUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        setError(null);
        const sessionUser = await fetchSessionUser();
        if (cancelled) return;
        setUser(sessionUser);
        writeLocalUser(sessionUser);
      } catch (err) {
        if (cancelled) return;
        console.error("useAuthUser refresh error:", err);
        const cached = readLocalUser();
        setUser(cached);
        setError("Failed to validate session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    refresh();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "user") return;
      setUser(readLocalUser());
    };
    const onCustom = () => setUser(readLocalUser());

    window.addEventListener("storage", onStorage);
    window.addEventListener(USER_STORAGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(USER_STORAGE_EVENT, onCustom);
    };
  }, []);

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
