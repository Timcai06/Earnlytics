import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ZapIcon, BotIcon, DiamondIcon, AppleIcon, WindowIcon, SearchIcon, CpuIcon, MetaIcon } from "@/components/icons";
import MysticalGlow from "@/components/ui/mystical-glow";

const steps = [
  { step: 1, title: "选择公司", desc: "从30+科技公司中选择感兴趣的目标" },
  { step: 2, title: "查看财报", desc: "实时获取最新财报数据和历史趋势" },
  { step: 3, title: "AI分析", desc: "1小时内获得专业AI分析报告" }
];

const faqs = [
  {
    q: "Earnlytics真的免费吗？",
    a: "是的，基础功能永久免费，无需注册即可使用所有核心功能。"
  },
  {
    q: "AI分析的准确性如何？",
    a: "我们的AI模型经过大量财报数据训练，能够准确提取关键财务指标和趋势。"
  },
  {
    q: "支持哪些公司？",
    a: "当前覆盖Apple、Microsoft、Google、NVIDIA、Meta等30+家主流科技公司。"
  },
  {
    q: "数据更新频率是多少？",
    a: "财报发布后1小时内即可获得AI分析结果，数据与官方同步。"
  }
];

export default function LandingPage() {
  const features = [
    {
      icon: <ZapIcon className="h-10 w-10 text-primary" />,
      title: "极速分析",
      description: "财报发布后1小时内完成AI分析，快速把握投资机会",
      borderColor: "border-primary",
      shadowColor: "shadow-[var(--shadow-card-primary)]",
    },
    {
      icon: <BotIcon className="h-10 w-10 text-success" />,
      title: "AI 智能解读",
      description: "复杂财务数据转化为通俗易懂的中文摘要",
      borderColor: "border-success",
      shadowColor: "shadow-[var(--shadow-focus-success)]",
    },
    {
      icon: <DiamondIcon className="h-10 w-10 text-info" />,
      title: "完全免费",
      description: "基础功能永久免费，无需注册即可访问",
      borderColor: "border-info",
      shadowColor: "shadow-[var(--shadow-card-primary)]",
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

          <div className="mb-16 flex flex-col items-center gap-4">
            <Link
              href="/home"
              className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-[var(--shadow-button-cta)] transition-all duration-300 ease-out hover:scale-105 hover:shadow-[var(--shadow-glow-lg)] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-shimmer" />
              <span className="relative flex items-center gap-2">
                免费开始分析
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              无需注册 · 永久免费
            </span>
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
                className={`flex flex-col gap-4 rounded-xl border ${feature.borderColor} bg-surface-secondary p-6 sm:p-8 ${feature.shadowColor}`}
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

      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            3步开始智能财报分析
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
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
            className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-primary bg-transparent px-8 py-4 text-base font-semibold text-primary transition-all duration-300 ease-out hover:border-primary-hover hover:bg-primary-hover/10 hover:text-primary-hover hover:shadow-[var(--shadow-glow-sm)] hover:scale-105 active:scale-[0.98]"
          >
            <span className="relative flex items-center gap-2">
              查看全部 30+ 家公司
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

        </div>

      </section>









      <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            常见问题
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-border bg-surface-secondary p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">{faq.q}</h3>
                <p className="text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
