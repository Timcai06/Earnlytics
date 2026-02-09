import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: "⚡",
      title: "极速分析",
      description: "财报发布后1小时内完成AI分析，快速把握投资机会",
      borderColor: "border-[#6366F1]",
      shadowColor: "shadow-[0_0_20px_rgba(99,102,241,0.13)]",
    },
    {
      icon: "🤖",
      title: "AI 智能解读",
      description: "复杂财务数据转化为通俗易懂的中文摘要",
      borderColor: "border-[#22C55E]",
      shadowColor: "shadow-[0_0_20px_rgba(34,197,94,0.13)]",
    },
    {
      icon: "💎",
      title: "完全免费",
      description: "基础功能永久免费，无需注册即可访问",
      borderColor: "border-[#3B82F6]",
      shadowColor: "shadow-[0_0_20px_rgba(59,130,246,0.13)]",
    },
  ];

  const stats = [
    { value: "30+", label: "覆盖公司" },
    { value: "1小时", label: "分析速度" },
    { value: "100%", label: "免费访问" },
  ];

  const companies = [
    { emoji: "🍎", name: "Apple", border: "border-[#3F3F46]" },
    { emoji: "🪟", name: "Microsoft", border: "border-[#3B82F6]" },
    { emoji: "🔍", name: "Google", border: "border-[#22C55E]" },
    { emoji: "🟢", name: "NVIDIA", border: "border-[#76B900]" },
    { emoji: "Ⓜ️", name: "Meta", border: "border-[#6366F1]" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background px-20 py-[120px]">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-2xl bg-[rgba(99,102,241,0.15)] px-4 py-2">
            <span className="text-sm font-semibold text-[#818CF8]">
              🤖 AI 驱动的财报分析
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-[64px] font-bold leading-tight text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            让财报分析变得简单
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-xl text-[#D4D4D8]">
            通过 AI 自动分析美国科技公司财报，1小时内获取深度洞察
          </p>

          <div className="mb-16">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.6)] transition-colors hover:bg-primary-hover"
            >
              开始探索
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-20">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <span className="text-5xl font-bold text-[#818CF8] drop-shadow-[0_0_20px_rgba(99,102,241,0.38)]">
                  {stat.value}
                </span>
                <span className="text-base text-[#D4D4D8]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-[40px] font-bold text-white">
            为什么选择 Earnlytics
          </h2>

          <div className="grid grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`flex flex-col gap-4 rounded-xl border ${feature.borderColor} bg-surface-secondary p-8 ${feature.shadowColor}`}
              >
                <span className="text-4xl">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-base text-[#A1A1AA] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Showcase */}
      <section className="bg-background px-20 py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-6 text-[48px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            覆盖热门科技公司
          </h2>
          <p className="mb-12 max-w-2xl text-xl text-[#A1A1AA]">
            追踪 Apple、Microsoft、NVIDIA 等 30+ 家科技巨头的财报动态
          </p>

          {/* Company Logos */}
          <div className="mb-10 flex items-center gap-8">
            {companies.map((company) => (
              <div
                key={company.name}
                className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${company.border} bg-surface-secondary text-4xl`}
              >
                {company.emoji}
              </div>
            ))}
          </div>

          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-lg border border-[#6366F1] bg-[rgba(99,102,241,0.15)] px-6 py-3 text-base font-medium text-[#E0E7FF] shadow-[0_0_15px_rgba(99,102,241,0.19)] transition-colors hover:bg-[rgba(99,102,241,0.25)]"
          >
            查看全部 30+ 家公司 →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background px-20 py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-8 text-[48px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            准备好探索财报洞察了吗？
          </h2>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg border border-[#818CF8] bg-[#6366EF] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-colors hover:bg-primary-hover"
          >
            立即开始
          </Link>
        </div>
      </section>
    </div>
  );
}
