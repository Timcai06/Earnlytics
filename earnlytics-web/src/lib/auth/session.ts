import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const ACCESS_TOKEN_COOKIE = "sb-access-token";
export const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

interface AppUserRow {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
}

export interface ResolvedSession {
  appUser: AppUserRow | null;
  authUserId: string | null;
  session: Session | null;
  refreshed: boolean;
  error: string | null;
}

function parseCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;

  for (const chunk of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = chunk.trim().split("=");
    if (rawKey === key) {
      return decodeURIComponent(rawValue.join("=") || "");
    }
  }

  return null;
}

function readBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export function readAccessTokenFromRequest(request: Request): string | null {
  const bearer = readBearerToken(request);
  if (bearer) return bearer;
  return parseCookieValue(request.headers.get("cookie"), ACCESS_TOKEN_COOKIE);
}

export function readRefreshTokenFromRequest(request: Request): string | null {
  return parseCookieValue(request.headers.get("cookie"), REFRESH_TOKEN_COOKIE);
}

export async function resolveSessionFromRequest(request: Request): Promise<ResolvedSession> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const admin = getSupabaseAdmin();

  if (!supabaseUrl || !supabaseAnonKey || !admin) {
    return {
      appUser: null,
      authUserId: null,
      session: null,
      refreshed: false,
      error: "Auth is not configured",
    };
  }

  const publicClient = createClient(supabaseUrl, supabaseAnonKey);
  let accessToken = readAccessTokenFromRequest(request);
  const refreshToken = readRefreshTokenFromRequest(request);
  let refreshed = false;
  let session: Session | null = null;

  if (!accessToken && !refreshToken) {
    return { appUser: null, authUserId: null, session: null, refreshed: false, error: null };
  }

  let userEmail: string | null = null;
  let authUserId: string | null = null;

  if (accessToken) {
    const { data, error } = await publicClient.auth.getUser(accessToken);
    if (!error && data.user?.email) {
      userEmail = data.user.email.toLowerCase();
      authUserId = data.user.id;
      session = { access_token: accessToken } as Session;
    }
  }

  if (!userEmail && refreshToken) {
    const { data: refreshedData, error: refreshError } = await publicClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshError || !refreshedData.session || !refreshedData.user?.email) {
      return { appUser: null, authUserId: null, session: null, refreshed: false, error: null };
    }

    accessToken = refreshedData.session.access_token;
    session = refreshedData.session;
    userEmail = refreshedData.user.email.toLowerCase();
    authUserId = refreshedData.user.id;
    refreshed = true;
  }

  if (!userEmail) {
    return { appUser: null, authUserId: null, session: null, refreshed: false, error: null };
  }

  const { data: appUserData, error: appUserError } = await admin
    .from("users")
    .select("id, email, name, is_active")
    .eq("email", userEmail)
    .maybeSingle();

  if (appUserError) {
    console.error("resolveSessionFromRequest app user query error:", appUserError);
    return {
      appUser: null,
      authUserId,
      session,
      refreshed,
      error: "Failed to resolve user profile",
    };
  }

  const appUser = (appUserData || null) as AppUserRow | null;
  if (!appUser || !appUser.is_active) {
    return { appUser: null, authUserId, session, refreshed, error: null };
  }

  return { appUser, authUserId, session, refreshed, error: null };
}

export function applySessionCookies(response: Response, session: Session) {
  const isSecure = process.env.NODE_ENV === "production";
  const maxAge = Math.max(session.expires_in || 3600, 3600);

  response.headers.append(
    "Set-Cookie",
    `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(session.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`
  );
  response.headers.append(
    "Set-Cookie",
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(session.refresh_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${isSecure ? "; Secure" : ""}`
  );
}

export function clearSessionCookies(response: Response) {
  const isSecure = process.env.NODE_ENV === "production";
  response.headers.append(
    "Set-Cookie",
    `${ACCESS_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? "; Secure" : ""}`
  );
  response.headers.append(
    "Set-Cookie",
    `${REFRESH_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? "; Secure" : ""}`
  );
}
