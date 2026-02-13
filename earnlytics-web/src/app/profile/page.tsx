"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div className="flex flex-col">
      {/* Profile Hero */}
      <section className="bg-background px-20 pt-20 pb-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-[40px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            账户设置
          </h1>
          <p className="text-lg text-text-secondary">管理您的个人信息和订阅偏好</p>
        </div>
      </section>

      {/* Profile Content */}
      <section className="bg-background px-20 pb-20">
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
          <div className="rounded-2xl border border-primary bg-surface-secondary p-8 shadow-[0_0_30px_rgba(99,102,241,0.19)]">
            {/* Avatar Section */}
            <div className="mb-8 flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-[rgba(99,102,241,0.2)] text-3xl font-bold text-primary-hover">
                张
              </div>
              <button className="rounded-lg border border-primary bg-[rgba(99,102,241,0.15)] px-4 py-2 text-sm font-medium text-[#E0E7FF] shadow-[0_0_10px_rgba(99,102,241,0.13)]">
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
                  defaultValue="张三"
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
                  defaultValue="zhangsan@example.com"
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
