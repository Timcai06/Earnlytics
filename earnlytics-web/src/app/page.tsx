import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ZapIcon, BotIcon, DiamondIcon, AppleIcon, WindowIcon, SearchIcon, CpuIcon, MetaIcon } from "@/components/icons";
import MysticalGlow from "@/components/ui/mystical-glow";

export default function LandingPage() {
  const features = [
    {
      icon: <ZapIcon className="h-10 w-10 text-primary" />,
      title: "极速分析",
      description: "财报发布后1小时内完成AI分析，快速把握投资机会",
      borderColor: "border-primary",
      shadowColor: "shadow-[0_0_20px_rgba(99,102,241,0.13)]",
    },
    {
      icon: <BotIcon className="h-10 w-10 text-success" />,
      title: "AI 智能解读",
      description: "复杂财务数据转化为通俗易懂的中文摘要",
      borderColor: "border-success",
      shadowColor: "shadow-[0_0_20px_rgba(34,197,94,0.13)]",
    },
    {
      icon: <DiamondIcon className="h-10 w-10 text-info" />,
      title: "完全免费",
      description: "基础功能永久免费，无需注册即可访问",
      borderColor: "border-info",
      shadowColor: "shadow-[0_0_20px_rgba(59,130,246,0.13)]",
    },
  ];

  const stats = [
    { value: "30+", label: "覆盖公司" },
    { value: "1小时", label: "分析速度" },
    { value: "100%", label: "免费访问" },
  ];

  const companies = [
    { icon: <AppleIcon className="h-8 w-8" />, name: "Apple", border: "border-border" },
    { icon: <WindowIcon className="h-8 w-8" />, name: "Microsoft", border: "border-info" },
    { icon: <SearchIcon className="h-8 w-8" />, name: "Google", border: "border-success" },
    { icon: <CpuIcon className="h-8 w-8 text-success" />, name: "NVIDIA", border: "border-success" },
    { icon: <MetaIcon className="h-8 w-8" />, name: "Meta", border: "border-primary" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-20 lg:py-28">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-2xl bg-primary-light px-4 py-2">
            <BotIcon className="h-4 w-4 text-primary-hover" />
            <span className="text-sm font-semibold text-primary-hover">
              AI 驱动的财报分析
            </span>
          </div>

          {/* Title */}
          <div className="relative mb-6">
            <MysticalGlow />
            <h1 className="relative z-10 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              让财报分析变得简单
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-xl text-text-secondary">
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
          <div className="flex items-center gap-8 sm:gap-12 lg:gap-20">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <span className="text-3xl font-bold text-primary-hover sm:text-4xl lg:text-5xl">
                  {stat.value}
                </span>
                <span className="text-base text-text-secondary">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white sm:mb-12 sm:text-3xl lg:text-4xl">
            为什么选择 Earnlytics
          </h2>

          <div className="grid grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`flex flex-col gap-4 rounded-xl border ${feature.borderColor} bg-surface-secondary p-8 ${feature.shadowColor}`}
              >
                {feature.icon}
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-base text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Showcase */}
      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            覆盖热门科技公司
          </h2>
          <p className="mb-12 max-w-2xl text-xl text-text-secondary">
            追踪 Apple、Microsoft、NVIDIA 等 30+ 家科技巨头的财报动态
          </p>

          {/* Company Logos */}
          <div className="mb-10 flex items-center gap-8">
            {companies.map((company) => (
              <div
                key={company.name}
                className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${company.border} bg-surface-secondary text-white`}
              >
                {company.icon}
              </div>
            ))}
          </div>

          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary-light px-6 py-3 text-base font-medium text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.19)] transition-colors hover:bg-primary-hover"
          >
            查看全部 30+ 家公司 →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            准备好探索财报洞察了吗？
          </h2>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-hover bg-primary px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-colors hover:bg-primary-hover"
          >
            立即开始
          </Link>
        </div>
      </section>
    </div>
  );
}
