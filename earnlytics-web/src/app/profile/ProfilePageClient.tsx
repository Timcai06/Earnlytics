"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { writeLocalUser } from "@/lib/auth/client";

function ProfileCompletionRing({ percent }: { percent: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-neutral-800)" strokeWidth="4" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary-500)" />
          <stop offset="100%" stopColor="var(--color-info-500)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ProfilePageClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editNameDraft, setEditNameDraft] = useState<string | null>(null);
  const editName = editNameDraft ?? user?.name ?? "";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [authLoading, router, user]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      writeLocalUser(null);
      router.replace("/home");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    if (user) {
      const updated = { ...user, name: editName };
      writeLocalUser(updated);
      setEditNameDraft(null);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = ["个人信息", "订阅管理", "通知偏好"];

  const completionPercent = user ? (user.name && user.email ? 75 : user.email ? 50 : 25) : 0;

  if (authLoading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-secondary">
        正在验证登录状态...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-surface px-4 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/[0.06] blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 h-[200px] w-[200px] rounded-full bg-info/[0.04] blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                <ProfileCompletionRing percent={completionPercent} />
                <div className="absolute inset-2 flex items-center justify-center rounded-full border-2 border-primary/30 bg-surface-secondary text-2xl font-bold text-primary-hover sm:text-3xl">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
                  {user?.name || "用户"}
                </h1>
                <p className="mb-2 text-sm text-text-secondary">{user?.email || ""}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-light px-3 py-1 text-xs font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    免费用户
                  </span>
                  <span className="text-xs text-text-tertiary">
                    资料完成度 {completionPercent}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-error/30 bg-error-light px-4 py-2.5 text-sm font-medium text-error transition-all duration-200 hover:border-error/50 hover:bg-error/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex gap-1 rounded-xl border border-border bg-surface p-1">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === index
                    ? "bg-primary text-white shadow-[var(--shadow-toggle-button)]"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">基本信息</h2>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-text-secondary">
                        姓名
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditNameDraft(e.target.value)}
                        className="h-12 border-border bg-surface-secondary px-4 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-text-secondary">
                        邮箱地址
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          readOnly
                          disabled
                          className="h-12 border-border bg-surface-secondary/50 px-4 text-text-tertiary"
                        />
                        <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <p className="text-xs text-text-tertiary">邮箱地址不可修改</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-light">
                    <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">安全设置</h2>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword" className="text-sm font-medium text-text-secondary">
                        当前密码
                      </Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        placeholder="••••••••"
                        className="h-12 border-border bg-surface-secondary px-4 text-white placeholder:text-text-tertiary"
                      />
                    </div>
                    <div />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-text-secondary">
                        新密码
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="至少8位字符"
                        className="h-12 border-border bg-surface-secondary px-4 text-white placeholder:text-text-tertiary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-text-secondary">
                        确认新密码
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="再次输入新密码"
                        className="h-12 border-border bg-surface-secondary px-4 text-white placeholder:text-text-tertiary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-success">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    已保存
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-white shadow-[var(--shadow-button-primary)] transition-all duration-200 hover:bg-primary-hover hover:shadow-[var(--shadow-button-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      保存中...
                    </>
                  ) : (
                    "保存更改"
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-light">
                  <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">订阅管理</h2>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary-light p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">免费计划</span>
                    <p className="text-xs text-text-secondary">享受所有基础功能</p>
                  </div>
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary-hover">当前计划</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["30+ 公司覆盖", "AI 分析报告", "实时数据"].map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-xs text-text-secondary">
                      <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-light">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">通知偏好</h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: "新财报分析通知", desc: "当有新的财报分析报告时通知您", defaultOn: true },
                  { label: "关注公司动态", desc: "您关注的公司发布财报时收到通知", defaultOn: true },
                  { label: "产品更新通知", desc: "平台功能更新和改进通知", defaultOn: false },
                  { label: "邮件摘要", desc: "每周发送一次财报分析摘要到邮箱", defaultOn: false },
                ].map((item) => (
                  <NotifToggle key={item.label} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NotifToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary p-4 transition-colors hover:border-border-highlight/30">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-text-tertiary">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${on ? "bg-primary shadow-[var(--shadow-toggle-active)]" : "bg-neutral-700"
          }`}
        role="switch"
        aria-checked={on}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
}
