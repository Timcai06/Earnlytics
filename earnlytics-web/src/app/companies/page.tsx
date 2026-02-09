import Link from "next/link";

export default function CompaniesPage() {
  const filters = ["全部", "芯片", "软件", "电商", "社交媒体"];
  
  const companies = [
    {
      name: "Apple Inc.",
      ticker: "AAPL",
      industry: "消费电子",
      marketCap: "$3.0T",
      earnings: "Q1 FY2026 | 2026-01-28",
      border: "border-[#6366F1]",
      shadow: "shadow-[0_0_20px_rgba(99,102,241,0.13)]",
      logo: "🍎",
    },
    {
      name: "Microsoft Corporation",
      ticker: "MSFT",
      industry: "软件",
      marketCap: "$2.8T",
      earnings: "Q1 FY2026 | 2026-01-25",
      border: "border-[#22C55E]",
      shadow: "shadow-[0_0_20px_rgba(34,197,94,0.13)]",
      logo: "🪟",
    },
    {
      name: "Alphabet Inc.",
      ticker: "GOOGL",
      industry: "互联网",
      marketCap: "$1.8T",
      earnings: "Q4 FY2025 | 2026-01-28",
      border: "border-[#3B82F6]",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.13)]",
      logo: "🔍",
    },
    {
      name: "NVIDIA Corporation",
      ticker: "NVDA",
      industry: "芯片",
      marketCap: "$2.2T",
      earnings: "Q4 FY2025 | 2026-02-12",
      border: "border-[#76B900]",
      shadow: "shadow-[0_0_20px_rgba(118,185,0,0.13)]",
      logo: "🟢",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background px-20 py-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-[40px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            科技公司目录
          </h1>
          <p className="text-lg text-[#A1A1AA]">探索我们覆盖的30+美国科技巨头</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-background px-20 pb-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#A1A1AA]">行业筛选：</span>
            <div className="flex gap-3">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    index === 0
                      ? "bg-primary text-white"
                      : "border border-[#6366F1] bg-[rgba(99,102,241,0.1)] text-[#E0E7FF]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="bg-background px-20 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-6">
            {companies.map((company) => (
              <div
                key={company.ticker}
                className={`rounded-2xl border ${company.border} bg-surface-secondary p-8 ${company.shadow}`}
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-4xl">
                    {company.logo}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{company.name}</h3>
                    <p className="text-sm text-[#64748B]">NASDAQ: {company.ticker}</p>
                    <p className="text-sm text-[#64748B]">行业：{company.industry}</p>
                    <p className="text-sm text-[#64748B]">市值：{company.marketCap}</p>
                  </div>
                </div>
                <div className="mb-4 h-px bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#64748B]">最新财报</p>
                    <p className="text-base font-semibold text-white">{company.earnings}</p>
                  </div>
                  <Link
                    href={`/earnings/${company.ticker}`}
                    className="rounded-lg border border-[#6366F1] bg-[rgba(99,102,241,0.15)] px-5 py-2.5 text-sm font-semibold text-[#818CF8]"
                  >
                    查看财报 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
