"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { BotIcon, LoaderIcon, XCircleIcon, SparklesIcon, AlertTriangleIcon, BarChart3Icon, ThumbsUpIcon, ThumbsDownIcon, ClockIcon, DatabaseIcon, TrendingUpIcon } from "@/components/icons";
import { EarningsTrendChart } from "@/components/sections/EarningsTrendChart";

interface EarningWithAnalysis {
  id: number;
  company_id: number;
  fiscal_year: number;
  fiscal_quarter: number;
  report_date: string;
  revenue: number | null;
  revenue_yoy_growth: number | null;
  eps: number | null;
  eps_estimate: number | null;
  eps_surprise: number | null;
  net_income: number | null;
  is_analyzed: boolean;
  data_source: 'fmp' | 'sec' | 'sample' | null;
  companies: {
    id: number;
    symbol: string;
    name: string;
    sector: string | null;
  };
  ai_analyses: {
    id: number;
    summary: string;
    highlights: string[] | null;
    concerns: string[] | null;
    sentiment: 'positive' | 'neutral' | 'negative' | null;
    created_at: string | null;
  } | null;
}

interface Props {
  params: Promise<{ symbol: string }>;
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
      return { bg: "bg-[rgba(34,197,94,0.15)]", text: "text-[#16A34A]", label: "积极" };
    case "negative":
      return { bg: "bg-[rgba(239,68,68,0.15)]", text: "text-[#EF4444]", label: "消极" };
    default:
      return { bg: "bg-[rgba(161,161,170,0.15)]", text: "text-[#A1A1AA]", label: "中性" };
  }
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "未知";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else {
    return "刚刚";
  }
}

function getDataSourceLabel(source: string | null): { label: string; color: string } {
  switch (source) {
    case "fmp":
      return { label: "FMP API", color: "text-[#818CF8]" };
    case "sec":
      return { label: "SEC EDGAR", color: "text-[#22C55E]" };
    case "sample":
      return { label: "样本数据", color: "text-[#A1A1AA]" };
    default:
      return { label: "未知来源", color: "text-[#A1A1AA]" };
  }
}

export default function EarningsPage({ params }: Props) {
  const { symbol } = use(params);
  const [earnings, setEarnings] = useState<EarningWithAnalysis | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<EarningWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [activeTab, setActiveTab] = useState<'revenue' | 'eps' | 'growth'>('revenue');
  const maxRetries = 3;

  // 过滤掉没有数据的财报记录（防御性编程）
  const validEarningsHistory = earningsHistory.filter(e => e.revenue !== null);

  const isLatestEarning = earnings && validEarningsHistory.length > 0 && earnings.id === validEarningsHistory[0].id;

  useEffect(() => {
    if (!symbol) {
      setError('未提供股票代码');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const latestResponse = await fetch(`/api/earnings?symbol=${symbol}&latest=true`);
        if (!latestResponse.ok) throw new Error(`Failed to fetch latest earnings: ${latestResponse.status}`);
        const latestData = await latestResponse.json();

        if (latestData.earnings) {
          setEarnings(latestData.earnings as EarningWithAnalysis);
        } else {
          setError('未找到这支股票的财报数据');
        }

        const historyResponse = await fetch(`/api/earnings?symbol=${symbol}`);
        if (!historyResponse.ok) throw new Error(`Failed to fetch earnings history: ${historyResponse.status}`);
        const historyData = await historyResponse.json();

        if (historyData.earnings) {
          setEarningsHistory(Array.isArray(historyData.earnings) ? historyData.earnings : [historyData.earnings]);
        }
      } catch (e) {
        if (retries < maxRetries) {
          setRetries(r => r + 1);
          return;
        }
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol, retries]);

  const handleEarningClick = async (earningId: number) => {
    if (earningId === earnings?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/earnings/${earningId}`);
      if (!response.ok) throw new Error('Failed to fetch earning');
      const data = await response.json();
      if (data.earnings) {
        setEarnings(data.earnings as EarningWithAnalysis);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const trendData = validEarningsHistory.map(e => ({
    quarter: `Q${e.fiscal_quarter} FY${e.fiscal_year.toString().slice(2)}`,
    date: e.report_date,
    revenue: e.revenue ?? 0,
    eps: e.eps ?? 0,
    revenueGrowth: e.revenue_yoy_growth ?? 0,
  }));

  if (loading && !earnings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <LoaderIcon className="mx-auto mb-4 h-10 w-10 animate-spin text-[#818CF8]" />
          <p className="text-[#A1A1AA]">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !earnings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <XCircleIcon className="mx-auto mb-4 h-10 w-10 text-[#EF4444]" />
          <p className="text-[#A1A1AA]">{error || '未找到财报数据'}</p>
          <Link href="/companies" className="mt-4 inline-block text-[#818CF8]">
            ← 返回公司列表
          </Link>
        </div>
      </div>
    );
  }

  const company = earnings.companies;
  const analysis = earnings.ai_analyses;
  const sentimentStyle = getSentimentStyle(analysis?.sentiment || null);
  const dataSource = getDataSourceLabel(earnings.data_source);

  return (
    <div className="flex flex-col">
      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-3xl sm:h-20 sm:w-20 sm:text-4xl">
              {company.symbol[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{company.name}</h1>
                {!isLatestEarning && (
                  <span className="rounded-lg bg-[#F59E0B]/20 px-2 py-0.5 text-xs text-[#F59E0B]">
                    历史财报
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#A1A1AA] sm:gap-5">
                <span>{company.symbol}</span>
                <span>Q{earnings.fiscal_quarter} FY{earnings.fiscal_year}</span>
                <span>发布日期: {earnings.report_date}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-[#27272A] px-2.5 py-1">
                  <DatabaseIcon className="h-3.5 w-3.5 text-[#818CF8]" />
                  <span className="text-xs text-[#A1A1AA]">数据来源: <span className={dataSource.color}>{dataSource.label}</span></span>
                </div>
                {analysis?.created_at && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#27272A] px-2.5 py-1">
                    <ClockIcon className="h-3.5 w-3.5 text-[#22C55E]" />
                    <span className="text-xs text-[#A1A1AA]">AI分析于 {formatRelativeTime(analysis.created_at)}</span>
                  </div>
                )}
                {isLatestEarning && (
                  <span className="rounded-lg bg-[#6366F1]/20 px-2 py-0.5 text-xs font-medium text-[#818CF8]">
                    最新
                  </span>
                )}
              </div>
            </div>
            <span className={`w-fit rounded-2xl ${sentimentStyle.bg} px-4 py-1.5 text-sm font-semibold ${sentimentStyle.text}`}>
              {sentimentStyle.label}
            </span>
            <Link
              href={`/analysis/${company.symbol}?earnings_id=${earnings.id}`}
              className="rounded-xl border border-[#6366F1] bg-[rgba(99,102,241,0.15)] px-4 py-1.5 text-sm font-semibold text-[#818CF8] hover:bg-[rgba(99,102,241,0.25)] transition-colors"
            >
              深度分析 →
            </Link>
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

          {validEarningsHistory.length > 1 && (
            <div className="mb-8 rounded-xl border border-border bg-surface-secondary p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-2 sm:mb-6">
                <TrendingUpIcon className="h-5 w-5 text-[#818CF8]" />
                <h3 className="text-lg font-bold text-white sm:text-xl">季度趋势对比</h3>
              </div>

              <div className="mb-4 flex gap-2 border-b border-border pb-4">
                {[
                  { key: 'revenue', label: '营收趋势' },
                  { key: 'eps', label: 'EPS趋势' },
                  { key: 'growth', label: '同比增长' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
                      activeTab === tab.key
                        ? 'bg-[#6366F1] text-white'
                        : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <EarningsTrendChart data={trendData} defaultType={activeTab} />
            </div>
          )}

          {analysis ? (
            <>
              <div className="mb-8 rounded-xl border-2 border-[#6366F1] bg-[rgba(99,102,241,0.1)] p-5 shadow-[0_0_30px_rgba(99,102,241,0.25)] sm:p-7">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                  <BotIcon className="h-6 w-6 text-[#818CF8] sm:h-7 sm:w-7" />
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
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#15803D] sm:mb-4 sm:text-lg">
                    <SparklesIcon className="h-5 w-5" />
                    核心亮点
                  </h3>
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
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#991B1B] sm:mb-4 sm:text-lg">
                    <AlertTriangleIcon className="h-5 w-5" />
                    关注点
                  </h3>
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
                <BotIcon className="h-6 w-6 animate-pulse text-[#818CF8]" />
                <p className="text-[#818CF8]">AI 分析正在生成中...</p>
              </div>
            </div>
          )}

          <div className="mb-8 rounded-xl border border-border bg-surface-secondary p-5 sm:p-7">
            <h3 className="mb-4 text-lg font-bold text-white sm:mb-6 sm:text-xl">历史财报</h3>
              {validEarningsHistory.length > 1 ? (
              <div className="space-y-3">
              {validEarningsHistory.map((e) => {
                  const eAnalysis = e.ai_analyses;
                  const eSentiment = eAnalysis?.sentiment || null;
                  const sentimentClass = eSentiment === 'positive' ? 'text-[#22C55E]' :
                                          eSentiment === 'negative' ? 'text-[#EF4444]' : 'text-[#A1A1AA]';
                  const isSelected = e.id === earnings?.id;
                  const isLatest = e.id === validEarningsHistory[0].id;

                  return (
                    <button
                      key={e.id}
                      onClick={() => handleEarningClick(e.id)}
                      disabled={loading}
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        isSelected ? 'bg-[#6366F1]/20 border border-[#6366F1]/50' : 'bg-background hover:bg-[#27272A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">
                          Q{e.fiscal_quarter} FY{e.fiscal_year}
                        </span>
                        <span className="text-xs text-[#A1A1AA]">{e.report_date}</span>
                        {isLatest && (
                          <span className="rounded bg-[#6366F1] px-1.5 py-0.5 text-xs text-white">最新</span>
                        )}
                        {isSelected && (
                          <span className="rounded bg-[#22C55E] px-1.5 py-0.5 text-xs text-white">当前</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {e.revenue && (
                          <span className="text-sm text-[#A1A1AA]">{formatCurrency(e.revenue)}</span>
                        )}
                        {eSentiment && (
                          <span className={`text-xs font-medium ${sentimentClass}`}>
                            {eSentiment === 'positive' ? '积极' : eSentiment === 'negative' ? '消极' : '中性'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center gap-2 rounded-lg bg-background">
                <p className="text-sm text-[#A1A1AA]">暂无历史财报</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
            <h3 className="mb-4 text-base font-semibold text-white sm:mb-5 sm:text-lg">这篇分析有帮助吗？</h3>
            <div className="flex gap-3 sm:gap-4">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm text-white hover:bg-[#27272A] sm:px-6 sm:py-3">
                <ThumbsUpIcon className="h-4 w-4" />
                有帮助
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm text-white hover:bg-[#27272A] sm:px-6 sm:py-3">
                <ThumbsDownIcon className="h-4 w-4" />
                需要改进
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
