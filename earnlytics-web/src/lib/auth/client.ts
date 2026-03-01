"use client";

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
}

export const USER_STORAGE_KEY = "user";
export const USER_STORAGE_EVENT = "user-storage-change";
const SESSION_CACHE_MS = 3000;

let sessionRequest: Promise<AuthUser | null> | null = null;
let lastSessionFetchedAt = 0;
let lastSessionUser: AuthUser | null = null;

export function readLocalUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.id !== "number" || typeof parsed.email !== "string") return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: typeof parsed.name === "string" ? parsed.name : null,
    };
  } catch {
    return null;
  }
}

export function writeLocalUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  const currentRaw = localStorage.getItem(USER_STORAGE_KEY);
  const nextRaw = user ? JSON.stringify(user) : null;
  if (currentRaw === nextRaw) return;

  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
  } else {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  lastSessionUser = user;
  lastSessionFetchedAt = Date.now();
  window.dispatchEvent(new Event(USER_STORAGE_EVENT));
}

export async function fetchSessionUser(options?: { force?: boolean }): Promise<AuthUser | null> {
  const now = Date.now();
  if (!options?.force && now - lastSessionFetchedAt < SESSION_CACHE_MS) {
    return lastSessionUser;
  }

  if (!options?.force && sessionRequest) {
    return sessionRequest;
  }

  sessionRequest = (async () => {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 401) {
      lastSessionUser = null;
      lastSessionFetchedAt = Date.now();
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch session");
    }

    const data = (await response.json()) as { user?: AuthUser };
    const user = data.user ?? null;
    lastSessionUser = user;
    lastSessionFetchedAt = Date.now();
    return user;
  })();

  try {
    return await sessionRequest;
  } finally {
    sessionRequest = null;
  }
}
