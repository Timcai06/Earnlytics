import Link from "next/link";

export default function HomePage() {
  const earnings = [
    {
      company: "Apple Inc.",
      ticker: "AAPL",
      quarter: "Q1 FY2026",
      date: "2026-01-28",
      revenue: "$119.6B",
      eps: "$2.18",
      yoy: "+8.2%",
      badge: "超预期",
    },
  ];

  const calendarItems = [
    { date: "2月10日 周一", company: "Palantir (PLTR)", time: "盘后发布" },
    { date: "2月12日 周三", company: "Nvidia (NVDA)", time: "盘后发布 | 预期 EPS: $0.85" },
    { date: "2月14日 周五", company: "Airbnb (ABNB)", time: "盘前发布 | 预期 EPS: $0.45" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background px-20 py-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-6 text-[48px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            探索科技公司财报
          </h1>
          <p className="max-w-2xl text-xl text-[#A1A1AA]">
            AI 驱动的财报分析，让复杂数据变得简单易懂
          </p>
        </div>
      </section>

      {/* Latest Earnings Section */}
      <section className="bg-surface px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-[36px] font-bold text-white">最新财报</h2>
            <Link href="/companies" className="text-base font-medium text-[#818CF8]">
              查看全部 →
            </Link>
          </div>

          <div className="space-y-4">
            {earnings.map((item) => (
              <Link
                key={item.ticker}
                href={`/earnings/${item.ticker}`}
                className="flex items-center gap-6 rounded-xl border border-[#6366F1] bg-surface-secondary p-6 transition-colors hover:bg-surface"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black text-2xl">
                  🍎
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{item.company}</h3>
                  <p className="text-sm text-[#A1A1AA]">
                    {item.quarter} | {item.date}
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-[#64748B]">营收</p>
                    <p className="text-lg font-semibold text-[#10B981]">{item.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">EPS</p>
                    <p className="text-lg font-semibold text-[#10B981]">{item.eps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">同比</p>
                    <p className="text-lg font-semibold text-[#10B981]">{item.yoy}</p>
                  </div>
                </div>
                <span className="rounded-xl bg-[rgba(34,197,94,0.15)] px-3 py-1.5 text-sm font-semibold text-[#22C55E]">
                  {item.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Preview Section */}
      <section className="bg-background px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-[36px] font-bold text-white">本周财报预告</h2>
            <Link href="/calendar" className="text-base font-medium text-[#818CF8]">
              查看完整日历 →
            </Link>
          </div>

          <div className="space-y-4">
            {calendarItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-5 rounded-xl border border-[#22C55E] bg-surface-secondary p-6"
              >
                <span className="text-base font-semibold text-primary">{item.date}</span>
                <p className="text-lg font-medium text-white">
                  {item.company} - {item.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
