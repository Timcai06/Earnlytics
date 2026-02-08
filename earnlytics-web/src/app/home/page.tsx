import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const earnings = [
    {
      company: "Apple Inc.",
      symbol: "AAPL",
      date: "2026.01.28",
      quarter: "Q1 FY2026",
      revenue: "$119.6B",
      eps: "$2.18",
      growth: "+8.2%",
      beatExpectations: true,
    },
  ];

  const calendarItems = [
    {
      date: "2月10日 周一",
      company: "Palantir (PLTR)",
      status: "盘后发布",
    },
    {
      date: "2月12日 周三",
      company: "Nvidia (NVDA)",
      status: "盘后发布",
      epsEstimate: "$0.85",
    },
    {
      date: "2月13日 周四",
      company: "Airbnb (ABNB)",
      status: "盘后发布",
      epsEstimate: "$0.45",
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center bg-white px-20 py-20 text-center">
        <h1 className="mb-8 text-[48px] font-bold text-slate-900">
          探索科技公司财报
        </h1>
        <p className="max-w-2xl text-xl text-slate-500">
          AI 驱动的财报分析，让复杂数据变得简单易懂
        </p>
      </section>

      <section className="px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[32px] font-bold text-slate-900">最新财报</h2>
            <Link
              href="/companies"
              className="flex items-center gap-1 text-base font-medium text-primary hover:underline"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {earnings.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
                    <span className="text-lg font-bold text-slate-600">
                      {item.symbol[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.company}
                      </h3>
                      <span className="text-sm text-slate-500">
                        {item.symbol}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {item.quarter} · {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">营收</p>
                      <p className="text-base font-semibold text-slate-900">
                        {item.revenue}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">EPS</p>
                      <p className="text-base font-semibold text-slate-900">
                        {item.eps}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">同比</p>
                      <p className="text-base font-semibold text-green-600">
                        {item.growth}
                      </p>
                    </div>
                  </div>
                  {item.beatExpectations && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      超预期
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[32px] font-bold text-slate-900">
              本周财报预告
            </h2>
            <Link
              href="/calendar"
              className="flex items-center gap-1 text-base font-medium text-primary hover:underline"
            >
              查看完整日历
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {calendarItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-6 rounded-xl border border-border bg-[#F8FAFC] p-6"
              >
                <div className="min-w-[100px]">
                  <p className="text-sm font-medium text-primary">{item.date}</p>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-slate-900">
                    {item.company}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{item.status}</span>
                  {item.epsEstimate && (
                    <span className="text-sm text-slate-500">
                      预期 EPS: {item.epsEstimate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
