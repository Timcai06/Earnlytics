import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { EarningWithAnalysis } from "@/types/database";

interface Props {
  params: { id: string };
}

async function getEarnings(symbol: string): Promise<EarningWithAnalysis | null> {
  if (!symbol || typeof symbol !== "string") {
    console.error("[getEarnings] Invalid symbol:", symbol);
    return null;
  }
  
  const normalizedSymbol = symbol.toUpperCase().trim();
  console.log("[getEarnings] Looking up company:", normalizedSymbol);
  
  try {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, symbol, name, sector")
      .eq("symbol", normalizedSymbol)
      .single();

    if (companyError) {
      console.error("[getEarnings] Company query error:", companyError.message);
      return null;
    }

    if (!company) {
      console.error("[getEarnings] Company not found:", normalizedSymbol);
      return null;
    }

    console.log("[getEarnings] Found company:", company.name, "ID:", company.id);

    const { data: earnings, error: earningsError } = await supabase
      .from("earnings")
      .select(`
        *,
        ai_analyses (*)
      `)
      .eq("company_id", company.id)
      .order("report_date", { ascending: false })
      .limit(1)
      .single();

    if (earningsError) {
      console.error("[getEarnings] Earnings query error:", earningsError.message);
      return null;
    }

    if (!earnings) {
      console.error("[getEarnings] No earnings found for company:", normalizedSymbol);
      return null;
    }

    console.log("[getEarnings] Found earnings for:", normalizedSymbol);

    return {
      ...earnings,
      companies: company,
    };
  } catch (e) {
    console.error("[getEarnings] Unexpected error:", e);
    return null;
  }
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function getSentimentStyle(sentiment: string | null) {
  switch (sentiment) {
    case "positive":
      return {
        bg: "bg-[rgba(34,197,94,0.15)]",
        text: "text-[#16A34A]",
        label: "积极",
      };
    case "negative":
      return {
        bg: "bg-[rgba(239,68,68,0.15)]",
        text: "text-[#EF4444]",
        label: "消极",
      };
    default:
      return {
        bg: "bg-[rgba(161,161,170,0.15)]",
        text: "text-[#A1A1AA]",
        label: "中性",
      };
  }
}

export default async function EarningsDetailPage({ params }: Props) {
  const id = params?.id;
  
  if (!id) {
    notFound();
  }
  
  const earnings = await getEarnings(id);

  if (!earnings) {
    notFound();
  }

  const company = earnings.companies;
  const analysis = earnings.ai_analyses;
  const sentimentStyle = getSentimentStyle(analysis?.sentiment || null);

  return (
    <div className="flex flex-col">
      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-3xl sm:h-20 sm:w-20 sm:text-4xl">
              {company.symbol[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{company.name}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#A1A1AA] sm:gap-5">
                <span>{company.symbol}</span>
                <span>Q{earnings.fiscal_quarter} FY{earnings.fiscal_year}</span>
                <span>发布日期: {earnings.report_date}</span>
              </div>
            </div>
            <span className={`w-fit rounded-2xl ${sentimentStyle.bg} px-4 py-1.5 text-sm font-semibold ${sentimentStyle.text}`}>
              {sentimentStyle.label}
            </span>
          </div>
        </div>
      </section>

      <div className="bg-surface px-4 py-6 sm:px-6 lg:px-20">
        <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
          <Link href="/home" className="text-[#A1A1AA]">首页</Link>
          <span className="text-[#3F3F46]">/</span>
          <Link href="/companies" className="text-[#A1A1AA]">公司</Link>
          <span className="text-[#3F3F46]">/</span>
          <span className="font-medium text-white">{company.symbol} Q{earnings.fiscal_quarter} FY{earnings.fiscal_year}</span>
        </div>
      </div>

      <section className="bg-background px-4 pb-16 sm:px-6 sm:pb-24 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {[
              { label: "营收", value: formatCurrency(earnings.revenue), change: earnings.revenue_yoy_growth ? `+${earnings.revenue_yoy_growth}% YoY` : "N/A", color: "border-[#6366F1]", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.13)]" },
              { label: "每股收益 (EPS)", value: earnings.eps ? `$${earnings.eps}` : "N/A", change: earnings.eps_estimate ? `预期 $${earnings.eps_estimate}` : "", color: "border-[#22C55E]", shadow: "shadow-[0_0_15px_rgba(34,197,94,0.13)]" },
              { label: "净利润", value: formatCurrency(earnings.net_income), change: "", color: "border-[#22C55E]", shadow: "shadow-[0_0_15px_rgba(34,197,94,0.13)]" },
              { label: "EPS超预期", value: earnings.eps_surprise ? `${earnings.eps_surprise > 0 ? '+' : ''}${earnings.eps_surprise}` : "N/A", change: "", color: "border-[#3B82F6]", shadow: "shadow-[0_0_15px_rgba(59,130,246,0.13)]" },
            ].map((metric) => (
              <div key={metric.label} className={`rounded-xl border ${metric.color} bg-surface-secondary p-4 sm:p-7 ${metric.shadow}`}>
                <p className="mb-2 text-xs text-[#A1A1AA] sm:mb-3 sm:text-sm">{metric.label}</p>
                <p className="mb-1 text-xl font-bold text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.25)] sm:mb-2 sm:text-[32px]">
                  {metric.value}
                </p>
                {metric.change && (
                  <p className="text-xs text-[#22C55E] sm:text-sm">{metric.change}</p>
                )}
              </div>
            ))}
          </div>

          {analysis ? (
            <>
              <div className="mb-8 rounded-xl border-2 border-[#6366F1] bg-[rgba(99,102,241,0.1)] p-5 shadow-[0_0_30px_rgba(99,102,241,0.25)] sm:p-7">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                  <span className="text-xl sm:text-2xl">🤖</span>
                  <h2 className="text-xl font-bold text-[#818CF8] drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] sm:text-2xl">
                    AI 分析摘要
                  </h2>
                </div>
                <p className="leading-relaxed text-sm text-[#E0E7FF] sm:text-base">
                  {analysis.summary}
                </p>
              </div>

              {analysis.highlights && analysis.highlights.length > 0 && (
                <div className="mb-8 rounded-xl border border-[#22C55E] bg-[rgba(34,197,94,0.1)] p-5 sm:p-7">
                  <h3 className="mb-3 text-base font-bold text-[#15803D] sm:mb-4 sm:text-lg">✨ 核心亮点</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {analysis.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#DCFCE7] sm:gap-3 sm:text-base">
                        <span className="text-[#22C55E]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.concerns && analysis.concerns.length > 0 && (
                <div className="mb-8 rounded-xl border border-[#EF4444] bg-[rgba(239,68,68,0.1)] p-5 sm:p-7">
                  <h3 className="mb-3 text-base font-bold text-[#991B1B] sm:mb-4 sm:text-lg">⚠️ 关注点</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {analysis.concerns.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#FECACA] sm:gap-3 sm:text-base">
                        <span className="text-[#EF4444]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="mb-8 rounded-xl border-2 border-[#6366F1] bg-[rgba(99,102,241,0.1)] p-7 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
              <div className="flex items-center justify-center gap-3 py-8">
                <span className="text-2xl">🤖</span>
                <p className="text-[#818CF8]">AI 分析正在生成中...</p>
              </div>
            </div>
          )}

          <div className="mb-8 rounded-xl border border-border bg-surface-secondary p-5 sm:p-7">
            <h3 className="mb-4 text-lg font-bold text-white sm:mb-6 sm:text-xl">历史业绩趋势</h3>
            <div className="flex h-48 items-center justify-center rounded-lg bg-background sm:h-72">
              <p className="text-sm text-[#A1A1AA] sm:text-base">📊 即将上线</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
            <h3 className="mb-4 text-base font-semibold text-white sm:mb-5 sm:text-lg">这篇分析有帮助吗？</h3>
            <div className="flex gap-3 sm:gap-4">
              <button className="rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm text-white hover:bg-[#27272A] sm:px-6 sm:py-3">
                👍 有帮助
              </button>
              <button className="rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm text-white hover:bg-[#27272A] sm:px-6 sm:py-3">
                👎 需要改进
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
