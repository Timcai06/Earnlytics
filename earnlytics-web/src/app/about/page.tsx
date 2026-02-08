"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Bot, Gem, Send } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "极速分析",
    description:
      "财报发布后1小时内生成AI分析，让您第一时间掌握公司动态",
  },
  {
    icon: Bot,
    title: "AI 驱动",
    description:
      "利用最先进的AI技术，将复杂的财务数据转化为易懂的中文摘要",
  },
  {
    icon: Gem,
    title: "完全免费",
    description:
      "基础功能永久免费，让每位投资者都能获得专业的财报分析",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="px-20 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-[48px] font-bold text-text-primary">
            关于 Earnlytics
          </h1>
          <p className="text-xl leading-relaxed text-text-secondary">
            我们是一家专注于美国科技公司财报分析的AI驱动平台。
            通过先进的人工智能技术，我们将复杂的财务数据转化为
            简单易懂的中文摘要，帮助中国投资者快速了解科技巨头的业绩表现。
          </p>
        </div>
      </section>

      <section className="bg-white px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-[32px] font-bold text-text-primary">
            我们的使命
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface p-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-text-primary">
                    {value.title}
                  </h3>
                  <p className="text-text-secondary">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-20 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-[32px] font-bold text-text-primary">
            联系我们
          </h2>
          <div className="rounded-xl border border-border bg-surface p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" placeholder="请输入您的姓名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入您的邮箱"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">主题</Label>
                <Input id="subject" placeholder="请输入主题" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">消息</Label>
                <textarea
                  id="message"
                  placeholder="请输入您的消息"
                  rows={5}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                发送消息
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
