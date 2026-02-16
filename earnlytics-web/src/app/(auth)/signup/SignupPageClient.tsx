"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/layout/AuthLayout";

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "弱", color: "bg-error" },
      { score: 2, label: "中", color: "bg-warning" },
      { score: 3, label: "强", color: "bg-info" },
      { score: 4, label: "非常强", color: "bg-success" },
    ];
    return levels[score];
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= level ? strength.color : "bg-border"
              }`}
          />
        ))}
      </div>
      <p className={`text-xs transition-colors ${strength.score <= 1
          ? "text-error"
          : strength.score === 2
            ? "text-warning"
            : strength.score === 3
              ? "text-info"
              : "text-success"
        }`}>
        密码强度：{strength.label}
      </p>
    </div>
  );
}

export default function SignupPageClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("请输入您的姓名");
      return;
    }
    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }
    if (password.length < 8) {
      setError("密码至少需要8位字符");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "注册失败");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="创建账户" subtitle="开始您的财报分析之旅">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error-light px-4 py-3 text-sm text-error">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 10-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-text-secondary">
            姓名
          </Label>
          <input
            id="name"
            type="text"
            placeholder="您的姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-white placeholder:text-text-tertiary transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-[var(--shadow-focus-primary)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-text-secondary">
            邮箱地址
          </Label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-white placeholder:text-text-tertiary transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-[var(--shadow-focus-primary)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-text-secondary">
            密码
          </Label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="至少 8 位字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-2 pr-11 text-sm text-white placeholder:text-text-tertiary transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-[var(--shadow-focus-primary)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-secondary cursor-pointer"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full cursor-pointer rounded-lg bg-primary text-base font-semibold text-white shadow-[var(--shadow-button-primary)] transition-all duration-200 hover:bg-primary-hover hover:shadow-[var(--shadow-button-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              注册中...
            </span>
          ) : (
            "创建账户"
          )}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <Separator className="flex-1" />
        <span className="mx-4 text-sm text-text-tertiary">或</span>
        <Separator className="flex-1" />
      </div>

      <button
        type="button"
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-border bg-surface text-base font-medium text-white transition-all duration-200 hover:border-primary/50 hover:bg-surface-secondary hover:shadow-[var(--shadow-glow-sm)]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        使用 Google 账户注册
      </button>

      <p className="mt-8 text-center text-sm text-text-tertiary">
        已有账户？{" "}
        <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary-hover hover:underline">
          立即登录
        </Link>
      </p>
    </AuthLayout>
  );
}
