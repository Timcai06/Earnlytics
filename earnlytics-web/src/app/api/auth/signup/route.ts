import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Auth is not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedName || normalizedName.length < 2) {
      return NextResponse.json({ error: "请输入有效的姓名（至少2个字符）" }, { status: 400 });
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "密码至少需要8个字符" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    const createdAuthUser = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: normalizedName },
    });

    if (createdAuthUser.error) {
      const msg = createdAuthUser.error.message.toLowerCase();
      if (msg.includes("already")) {
        return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
      }
      console.error("Signup auth create user error:", createdAuthUser.error);
      return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
    }

    const passwordHash = hashPassword(password);

    const { error: insertError } = await supabase.from("users").insert({
      name: normalizedName,
      email: normalizedEmail,
      password_hash: passwordHash,
      is_active: true,
      email_verified: true,
    });

    if (insertError) {
      console.error("Signup users insert error:", insertError);

      // Rollback auth user to avoid orphaned accounts.
      if (createdAuthUser.data.user?.id) {
        await supabase.auth.admin.deleteUser(createdAuthUser.data.user.id);
      }

      return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
    }

    return NextResponse.json({
      message: "注册成功！",
      success: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
