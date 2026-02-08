import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Check,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";

// Mock earnings data
const earningsData = {
  company: {
    name: "Apple Inc.",
    symbol: "AAPL",
    logo: "A",
    quarter: "Q1 FY2026",
    reportDate: "2026年1月28日",
  },
  metrics: {
    revenue: { value: "$119.6B", label: "营收", change: "+8.2%" },
    eps: { value: "$2.18", label: "每股收益", change: "+12.1%" },
    yoy: { value: "+8.2%", label: "同比增长", change: "超预期" },
  },
  sentiment: "积极",
  aiSummary:
    "Apple在2026财年第一季度展现出强劲的增长势头，服务业务和创新设备品类成为主要增长引擎。尽管面临全球供应链挑战，公司通过多元化供应链策略有效控制了成本压力。",
  highlights: [
    "服务业务收入创历史新高，达到$238亿美元",
    "iPhone在新兴市场销量增长15%",
    "毛利率提升至43.5%，超出市场预期",
  ],
  concerns: [
    "大中华区销售额同比下降3%",
    "Mac业务连续第四个季度下滑",
  ],
  relatedCompanies: [
    { name: "Microsoft", symbol: "MSFT", logo: "M" },
    { name: "Google", symbol: "GOOGL", logo: "G" },
    { name: "Amazon", symbol: "AMZN", logo: "A" },
  ],
};

export default async function EarningsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // TODO: Replace with actual data fetching based on id
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = await params;
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="px-20 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <Link href="/" className="hover:text-primary">
              首页
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/companies" className="hover:text-primary">
              财报
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary">
              {earningsData.company.name} {earningsData.company.quarter}
            </span>
          </div>
        </div>
      </section>

      {/* Company Header */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-slate-100">
              <span className="text-2xl font-bold text-slate-600">
                {earningsData.company.logo}
              </span>
            </div>

            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[32px] font-bold text-text-primary">
                  {earningsData.company.name}
                </h1>
                <span className="text-xl text-text-tertiary">
                  {earningsData.company.symbol}
                </span>
              </div>
              <p className="mt-1 text-text-secondary">
                发布于 {earningsData.company.reportDate}
              </p>
            </div>

            {/* Sentiment Badge */}
            <Badge
              className={
                earningsData.sentiment === "积极"
                  ? "ml-auto bg-green-100 text-green-700"
                  : "ml-auto bg-red-100 text-red-700"
              }
            >
              {earningsData.sentiment}
            </Badge>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-6">
            {/* Revenue Card */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <DollarSign className="h-5 w-5" />
                <span>{earningsData.metrics.revenue.label}</span>
              </div>
              <p className="mt-3 text-[32px] font-bold text-text-primary">
                {earningsData.metrics.revenue.value}
              </p>
              <p className="mt-1 text-green-600">
                {earningsData.metrics.revenue.change}
              </p>
            </div>

            {/* EPS Card */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <TrendingUp className="h-5 w-5" />
                <span>{earningsData.metrics.eps.label}</span>
              </div>
              <p className="mt-3 text-[32px] font-bold text-text-primary">
                {earningsData.metrics.eps.value}
              </p>
              <p className="mt-1 text-green-600">
                {earningsData.metrics.eps.change}
              </p>
            </div>

            {/* YoY Growth Card */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <BarChart3 className="h-5 w-5" />
                <span>{earningsData.metrics.yoy.label}</span>
              </div>
              <p className="mt-3 text-[32px] font-bold text-text-primary">
                {earningsData.metrics.yoy.value}
              </p>
              <Badge
                variant="outline"
                className="mt-1 border-green-200 bg-green-50 text-green-700"
              >
                {earningsData.metrics.yoy.change}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* AI Summary */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-[#F5F3FF] p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg font-semibold text-text-primary">
                AI 总结
              </span>
            </div>
            <p className="text-lg leading-relaxed text-text-secondary">
              {earningsData.aiSummary}
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-[#DCFCE7] p-8">
            <div className="mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold text-green-800">
                核心亮点
              </span>
            </div>
            <ul className="space-y-3">
              {earningsData.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3 text-green-800">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Concerns */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-[#FEF2F2] p-8">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold text-red-800">关注点</span>
            </div>
            <ul className="space-y-3">
              {earningsData.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-3 text-red-800">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Historical Chart */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-border bg-surface p-8">
            <h3 className="mb-6 text-xl font-semibold text-text-primary">
              历史业绩
            </h3>
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border bg-[#F8FAFC]">
              <div className="text-center text-text-tertiary">
                <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">图表占位符 - 待接入真实数据</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Companies */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-6 text-xl font-semibold text-text-primary">
            相关公司
          </h3>
          <div className="flex gap-4">
            {earningsData.relatedCompanies.map((company) => (
              <Link
                key={company.symbol}
                href={`/earnings/${company.symbol.toLowerCase()}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <span className="font-semibold text-slate-600">
                    {company.logo}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">{company.name}</p>
                  <p className="text-sm text-text-tertiary">{company.symbol}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="px-20 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="mb-6 text-lg font-medium text-text-primary">
              这份分析是否有帮助？
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="gap-2">
                <ThumbsUp className="h-5 w-5" />
                有帮助
              </Button>
              <Button variant="outline" className="gap-2">
                <ThumbsDown className="h-5 w-5" />
                不太有帮助
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
