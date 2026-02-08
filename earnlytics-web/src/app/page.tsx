import Link from "next/link";
import { Zap, Bot, Gem, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: "极速分析",
      description: "财报发布后1小时内完成分析",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Bot,
      title: "AI智能解读",
      description: "复杂财务数据转化为通俗易懂的中文摘要",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Gem,
      title: "完全免费",
      description: "基础功能永久免费，立即开始探索",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const stats = [
    { value: "30+", label: "覆盖公司" },
    { value: "1小时", label: "分析速度" },
    { value: "100%", label: "免费使用" },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-white px-20 py-[120px]">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center rounded-2xl bg-primary-light px-4 py-2">
            <span className="text-sm font-medium text-primary">
              AI 驱动的财报分析
            </span>
          </div>

          <h1 className="mb-6 text-[64px] font-bold leading-tight text-slate-900">
            让财报分析变得简单
          </h1>

          <p className="mb-10 max-w-2xl text-xl text-slate-500">
            通过 AI 自动分析美国科技公司财报，1小时内获取深度洞察
          </p>

          <div className="mb-16 flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              开始探索
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              查看示例
            </Link>
          </div>

          <div className="flex items-center gap-20">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <span className="text-5xl font-bold text-primary">
                  {stat.value}
                </span>
                <span className="text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAFA] px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-[40px] font-bold text-slate-900">
            为什么选择 Earnlytics
          </h2>

          <div className="grid grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-white p-8"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconBg}`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="text-base text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-20 py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-8 text-[36px] font-bold text-white">
            准备好探索财报洞察了吗？
          </h2>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            立即开始
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
