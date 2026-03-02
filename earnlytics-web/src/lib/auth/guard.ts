"use client";

import { writeLocalUser } from "@/lib/auth/client";

const REDIRECT_DEBOUNCE_MS = 1000;
let lastRedirectAt = 0;

function normalizeNext(nextPath: string) {
  if (!nextPath.startsWith("/")) return "/home";
  if (nextPath.startsWith("//")) return "/home";
  return nextPath;
}

export function redirectToLoginOnce(
  router: { replace: (href: string) => void },
  nextPath: string
) {
  const now = Date.now();
  if (now - lastRedirectAt < REDIRECT_DEBOUNCE_MS) {
    return;
  }
  lastRedirectAt = now;
  writeLocalUser(null);
  const safeNext = normalizeNext(nextPath);
  router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
}
