import Link from "next/link";

export default function EarningsDetailPage() {
  return (
    <div className="flex flex-col">
      {/* Detail Hero */}
      <section className="bg-background px-20 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-4xl">
              🍎
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Apple Inc.</h1>
              <div className="mt-2 flex gap-5 text-sm text-[#A1A1AA]">
                <span>AAPL</span>
                <span>Q1 FY2026</span>
                <span>发布日期: 2026-01-28</span>
              </div>
            </div>
            <span className="rounded-2xl bg-[rgba(34,197,94,0.15)] px-4 py-1.5 text-sm font-semibold text-[#16A34A]">
              ✓ 积极
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-surface px-20 py-8">
        <div className="mx-auto max-w-6xl flex items-center gap-2 text-sm">
          <Link href="/home" className="text-[#A1A1AA]">首页</Link>
          <span className="text-[#3F3F46]">/</span>
          <Link href="/earnings" className="text-[#A1A1AA]">财报</Link>
          <span className="text-[#3F3F46]">/</span>
          <span className="font-medium text-white">Apple Q1 2026</span>
        </div>
      </div>

      {/* Detail Content */}
      <section className="bg-background px-20 pb-24">
        <div className="mx-auto max-w-4xl">
          {/* Metrics Grid */}
          <div className="mb-8 grid grid-cols-4 gap-5">
            {[
              { label: "营收", value: "$119.6B", change: "+8.2% YoY", color: "border-[#6366F1]", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.13)]" },
              { label: "每股收益 (EPS)", value: "$2.18", change: "超预期 预期 $2.10", color: "border-[#22C55E]", shadow: "shadow-[0_0_15px_rgba(34,197,94,0.13)]" },
              { label: "净利润", value: "$33.9B", change: "+11.5% YoY", color: "border-[#22C55E]", shadow: "shadow-[0_0_15px_rgba(34,197,94,0.13)]" },
              { label: "毛利率", value: "46.2%", change: "+1.2% YoY", color: "border-[#3B82F6]", shadow: "shadow-[0_0_15px_rgba(59,130,246,0.13)]" },
            ].map((metric) => (
              <div key={metric.label} className={`rounded-xl border ${metric.color} bg-surface-secondary p-7 ${metric.shadow}`}>
                <p className="mb-3 text-sm text-[#A1A1AA]">{metric.label}</p>
                <p className="mb-2 text-[40px] font-bold text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                  {metric.value}
                </p>
                <p className="text-sm text-[#22C55E]">{metric.change}</p>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div className="mb-8 rounded-xl border-2 border-[#6366F1] bg-[rgba(99,102,241,0.1)] p-7 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <h2 className="text-2xl font-bold text-[#818CF8] drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                AI 分析摘要
              </h2>
            </div>
            <p className="leading-relaxed text-[#E0E7FF]">
              苹果 Q1 财报表现强劲，营收和利润均超市场预期。iPhone 销售保持稳健增长，服务业务继续成为亮点，同比增长 15%。大中华区市场虽有所承压，但整体表现仍优于预期。公司对下季度给出积极指引，预计营收将达到 $90-93B。
            </p>
          </div>

          {/* Highlights */}
          <div className="mb-8 rounded-xl border border-[#22C55E] bg-[rgba(34,197,94,0.1)] p-7">
            <h3 className="mb-4 text-lg font-bold text-[#15803D]">✨ 核心亮点</h3>
            <ul className="space-y-3">
              {[
                "服务业务营收创历史新高，达到 $23.1B，同比增长 15%",
                "iPhone 营收 $69.7B，超出分析师预期，显示需求依然强劲",
                "毛利率提升至 46.2%，运营效率持续优化",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#DCFCE7]">
                  <span className="text-[#22C55E]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Concerns */}
          <div className="mb-8 rounded-xl border border-[#EF4444] bg-[rgba(239,68,68,0.1)] p-7">
            <h3 className="mb-4 text-lg font-bold text-[#991B1B]">⚠️ 关注点</h3>
            <ul className="space-y-3">
              {[
                "大中华区营收下降 8%，地缘政治风险持续",
                "Mac 和 iPad 销售疲软，同比分别下降 5% 和 10%",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#FECACA]">
                  <span className="text-[#EF4444]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Historical Charts Placeholder */}
          <div className="mb-8 rounded-xl border border-border bg-surface-secondary p-7">
            <h3 className="mb-6 text-xl font-bold text-white">历史业绩趋势</h3>
            <div className="flex h-72 items-center justify-center rounded-lg bg-background">
              <p className="text-[#A1A1AA]">📊 营收趋势图（最近8个季度）</p>
            </div>
          </div>

          {/* Feedback */}
          <div className="rounded-xl border border-border bg-surface p-7">
            <h3 className="mb-5 text-lg font-semibold text-white">这篇分析有帮助吗？</h3>
            <div className="flex gap-4">
              <button className="rounded-lg border border-border bg-surface-secondary px-6 py-3 text-white hover:bg-[#27272A]">
                👍 有帮助
              </button>
              <button className="rounded-lg border border-border bg-surface-secondary px-6 py-3 text-white hover:bg-[#27272A]">
                👎 需要改进
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
