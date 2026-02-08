"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Bell, Camera } from "lucide-react";

const tabs = [
  { id: "profile", label: "个人信息", icon: User },
  { id: "subscription", label: "订阅管理", icon: CreditCard },
  { id: "notifications", label: "通知偏好", icon: Bell },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-background">
      <section className="px-20 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-[40px] font-bold text-text-primary">
            账户设置
          </h1>
          <p className="text-lg text-text-secondary">
            管理您的个人信息和偏好设置
          </p>
        </div>
      </section>

      <section className="px-20 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-8">
            <div className="w-64 shrink-0">
              <div className="rounded-xl border border-border bg-surface p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1">
              {activeTab === "profile" && (
                <div className="rounded-xl border border-border bg-surface p-8">
                  <h2 className="mb-6 text-xl font-semibold text-text-primary">
                    个人信息
                  </h2>

                  <div className="mb-8 flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-10 w-10 text-slate-400" />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      更换头像
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">姓名</Label>
                        <Input
                          id="name"
                          placeholder="请输入姓名"
                          defaultValue="张三"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="请输入邮箱"
                          defaultValue="zhangsan@example.com"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-4 text-lg font-medium text-text-primary">
                        修改密码
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">当前密码</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="请输入当前密码"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">新密码</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="请输入新密码"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">确认新密码</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="请再次输入新密码"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>保存更改</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "subscription" && (
                <div className="rounded-xl border border-border bg-surface p-8">
                  <h2 className="mb-6 text-xl font-semibold text-text-primary">
                    订阅管理
                  </h2>
                  <div className="rounded-lg border border-border bg-slate-50 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          当前计划
                        </p>
                        <p className="text-2xl font-bold text-text-primary">
                          免费版
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          基础功能永久免费
                        </p>
                      </div>
                      <Button>升级到 Pro</Button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="mb-3 font-medium text-text-primary">
                      包含功能
                    </h3>
                    <ul className="space-y-2 text-text-secondary">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        查看所有公司财报
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        AI 财报摘要
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        财报日历
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="rounded-xl border border-border bg-surface p-8">
                  <h2 className="mb-6 text-xl font-semibold text-text-primary">
                    通知偏好
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium text-text-primary">
                          财报提醒
                        </p>
                        <p className="text-sm text-text-secondary">
                          关注的财报发布前邮件提醒
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          defaultChecked
                        />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary"></div>
                        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all peer-checked:left-[22px]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium text-text-primary">
                          每周摘要
                        </p>
                        <p className="text-sm text-text-secondary">
                          每周一发送本周财报预告
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          defaultChecked
                        />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary"></div>
                        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all peer-checked:left-[22px]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium text-text-primary">
                          产品更新
                        </p>
                        <p className="text-sm text-text-secondary">
                          新功能和改进通知
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary"></div>
                        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all peer-checked:left-[22px]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
