import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { applySessionCookies } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === newHash;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Auth is not configured" }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const publicClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { email, password } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    }

    let signInResult = await publicClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInResult.error) {
      // Legacy fallback: verify old users table password, then migrate to Supabase Auth.
      const { data: legacyUser, error: legacyError } = await adminClient
        .from("users")
        .select("id, email, name, password_hash, is_active")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (legacyError || !legacyUser || !legacyUser.is_active) {
        return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
      }

      const isLegacyPasswordValid = verifyPassword(password, legacyUser.password_hash);
      if (!isLegacyPasswordValid) {
        return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
      }

      const created = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: legacyUser.name ? { name: legacyUser.name } : undefined,
      });

      if (created.error && !created.error.message.toLowerCase().includes("already")) {
        console.error("legacy user migration create auth user error:", created.error);
        return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
      }

      signInResult = await publicClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
    }

    if (signInResult.error || !signInResult.data.session) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const session = signInResult.data.session;

    const { data: existingUser, error: userQueryError } = await adminClient
      .from("users")
      .select("id, name, email, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userQueryError) {
      console.error("login users query error:", userQueryError);
      return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
    }

    let appUser = existingUser;
    if (!appUser) {
      const fallbackName =
        signInResult.data.user?.user_metadata?.name ||
        normalizedEmail.split("@")[0] ||
        "User";

      const { data: insertedUser, error: insertError } = await adminClient
        .from("users")
        .insert({
          name: fallbackName,
          email: normalizedEmail,
          password_hash: hashPassword(password),
          is_active: true,
          email_verified: true,
        })
        .select("id, name, email, is_active")
        .single();

      if (insertError || !insertedUser) {
        console.error("login users insert error:", insertError);
        return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
      }

      appUser = insertedUser;
    }

    if (!appUser.is_active) {
      return NextResponse.json({ error: "账户已被禁用" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: "登录成功！",
      user: {
        id: appUser.id,
        name: appUser.name,
        email: appUser.email,
      },
    });

    applySessionCookies(response, session);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
