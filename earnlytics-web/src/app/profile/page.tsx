"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/home";
  };

  return (
    <div className="flex flex-col">
      {/* Profile Hero */}
      <section className="bg-background px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10 lg:px-20">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-white">
              账户设置
            </h1>
            <p className="text-lg text-text-secondary">管理您的个人信息和订阅偏好</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            退出登录
          </button>
        </div>
      </section>

      {/* Profile Content */}
      <section className="bg-background px-4 pb-16 sm:px-6 sm:pb-20 lg:px-20">
        <div className="mx-auto max-w-3xl">
          {/* Tab Navigation */}
          <div className="mb-8 flex gap-2">
            {["个人信息", "订阅管理", "通知偏好"].map((tab, index) => (
              <button
                key={tab}
                className={`rounded-lg px-6 py-3 text-[15px] font-medium ${
                  index === 0
                    ? "border border-primary bg-primary text-white"
                    : "border border-border bg-transparent text-text-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl border border-primary bg-surface-secondary p-6 shadow-[0_0_30px_rgba(99,102,241,0.19)]">
            {/* Avatar Section */}
            <div className="mb-8 flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-primary-light text-3xl font-bold text-primary-hover">
                {user?.name?.[0] || "用户"}
              </div>
              <button className="rounded-lg border border-primary bg-primary-light px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_10px_rgba(99,102,241,0.13)]">
                更换头像
              </button>
            </div>

            {/* Form Fields */}
            <div className="mb-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-white">
                  姓名
                </Label>
                <Input
                  id="name"
                  type="text"
                  defaultValue={user?.name || ""}
                  className="h-12 border-border bg-surface px-4 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  邮箱地址
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="h-12 border-border bg-surface px-4 text-text-secondary"
                />
                <p className="text-xs text-text-tertiary">邮箱地址不可修改</p>
              </div>
            </div>

            {/* Password Section */}
            <div className="mb-8 border-t border-border pt-8">
              <h3 className="mb-6 text-lg font-semibold text-white">修改密码</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-sm font-medium text-white">
                    当前密码
                  </Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 border-border bg-surface px-4 text-white placeholder:text-text-tertiary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-white">
                    新密码
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="至少8位字符"
                    className="h-12 border-border bg-surface px-4 text-white placeholder:text-text-tertiary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                    确认新密码
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入新密码"
                    className="h-12 border-border bg-surface px-4 text-white placeholder:text-text-tertiary"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.6)] transition-colors hover:bg-primary-hover">
              保存更改
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
