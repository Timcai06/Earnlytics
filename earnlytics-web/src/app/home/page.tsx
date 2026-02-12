"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AppleIcon } from "@/components/icons";
import SubscribeForm from "@/components/sections/SubscribeForm";
import HorizontalGlow from "@/components/ui/horizontal-glow";
import { EarningsListSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { NoDataState, CalendarEmptyState } from "@/components/ui/empty-state";

interface EarningsWithCompany {
  id: number;
  fiscal_year: number;
  fiscal_quarter: number;
  report_date: string;
  revenue: number | null;
  eps: number | null;
  revenue_yoy_growth: number | null;
  eps_surprise: number | null;
  companies: {
    symbol: string;
    name: string;
  } | null;
  ai_analyses: {
    sentiment: 'positive' | 'neutral' | 'negative' | null;
  } | null;
}

interface CalendarEvent {
  id: number;
  date: string;
  symbol: string;
  companyName: string;
  fiscalYear: number;
  fiscalQuarter: number;
}

function formatCurrency(value: number | null): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

function getEarningsBadge(epsSurprise: number | null, sentiment: string | null): { text: string; color: string } {
  if (epsSurprise && epsSurprise > 0) {
    return { text: '超预期', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  }
  if (sentiment === 'positive') {
    return { text: '积极', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  }
  if (sentiment === 'negative') {
    return { text: '消极', color: 'bg-red-500/15 text-red-400 border-red-500/30' };
  }
  return { text: '中性', color: 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]' };
}

export default function HomePage() {
  const [latestEarnings, setLatestEarnings] = useState<EarningsWithCompany[]>([]);
  const [upcomingEarnings, setUpcomingEarnings] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (!supabase) {
          setError('Database not configured');
          setLoading(false);
          return;
        }
        
        const { data: latestData, error: latestError } = await supabase
          .from('earnings')
          .select(`
            id,
            fiscal_year,
            fiscal_quarter,
            report_date,
            revenue,
            eps,
            revenue_yoy_growth,
            eps_surprise,
            companies (
              symbol,
              name
            ),
            ai_analyses (
              sentiment
            )
          `)
          .not('revenue', 'is', null)
          .order('report_date', { ascending: false })
          .limit(5);

        if (latestError) throw latestError;

        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('earnings')
          .select(`
            id,
            report_date,
            fiscal_year,
            fiscal_quarter,
            companies (
              symbol,
              name
            )
          `)
          .gte('report_date', today.toISOString().split('T')[0])
          .lte('report_date', nextWeek.toISOString().split('T')[0])
          .order('report_date', { ascending: true })
          .limit(5);

        if (upcomingError) throw upcomingError;

        const mappedLatest = latestData
          ?.filter((item: any) => item.companies !== null && item.revenue > 0)
          .map((item: any) => ({
            id: item.id,
            fiscal_year: item.fiscal_year,
            fiscal_quarter: item.fiscal_quarter,
            report_date: item.report_date,
            revenue: item.revenue,
            eps: item.eps,
            revenue_yoy_growth: item.revenue_yoy_growth,
            eps_surprise: item.eps_surprise,
            companies: Array.isArray(item.companies) ? item.companies[0] : item.companies,
            ai_analyses: Array.isArray(item.ai_analyses) ? item.ai_analyses[0] : item.ai_analyses,
          })) || [];

        const mappedUpcoming = upcomingData
          ?.filter((e: any) => e.companies !== null)
          .map((e: any) => {
            const company = Array.isArray(e.companies) ? e.companies[0] : e.companies;
            return {
              id: e.id,
              date: e.report_date,
              symbol: company?.symbol || '',
              companyName: company?.name || '',
              fiscalYear: e.fiscal_year,
              fiscalQuarter: e.fiscal_quarter,
            };
          }) || [];

        setLatestEarnings(mappedLatest);
        setUpcomingEarnings(mappedUpcoming);
      } catch (e: any) {
        console.error('Error fetching data:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background px-4 py-16 sm:px-6 lg:px-20 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <HorizontalGlow />
            <h1 className="relative z-10 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              探索科技公司财报
            </h1>
          </div>
          <p className="max-w-2xl text-lg text-[#A1A1AA]">
            AI 驱动的财报分析，让复杂数据变得简单易懂
          </p>
        </div>
      </section>

      {/* Latest Earnings Section */}
      <section className="bg-surface px-4 py-12 sm:px-6 lg:px-20 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">最新财报</h2>
            <Link 
              href="/companies" 
              className="text-sm font-medium text-[#818CF8] hover:text-[#6366F1] transition-colors"
            >
              查看全部 →
            </Link>
          </div>

          {loading ? (
            <EarningsListSkeleton count={3} />
          ) : error ? (
            <NoDataState 
              title="加载失败" 
              description="无法获取财报数据，请稍后重试"
            />
          ) : latestEarnings.length === 0 ? (
            <NoDataState 
              title="暂无财报数据" 
              description="目前还没有已发布的财报数据"
            />
          ) : (
            <div className="space-y-4">
              {latestEarnings.map((item) => {
                const badge = getEarningsBadge(item.eps_surprise, item.ai_analyses?.sentiment || null);
                return (
                  <Link
                    key={item.id}
                    href={`/earnings/${item.companies?.symbol?.toLowerCase()}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-[#27272A] bg-[#111111] p-4 transition-all hover:border-[#6366F1]/50 hover:bg-[#1A1A1A] sm:gap-6 sm:p-6"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#1A1A1A] text-white sm:h-16 sm:w-16">
                      <AppleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white">{item.companies?.name}</h3>
                      <p className="text-sm text-[#71717A]">
                        Q{item.fiscal_quarter} FY{item.fiscal_year} · {item.report_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8">
                      <div className="text-center">
                        <p className="text-xs text-[#71717A]">营收</p>
                        <p className="text-base font-semibold text-emerald-400 sm:text-lg">{formatCurrency(item.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#71717A]">EPS</p>
                        <p className="text-base font-semibold text-white sm:text-lg">{item.eps ? `$${item.eps}` : 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#71717A]">同比</p>
                        <p className="text-base font-semibold text-white sm:text-lg">
                          {item.revenue_yoy_growth ? `+${item.revenue_yoy_growth}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-medium border ${badge.color} whitespace-nowrap`}>
                      {badge.text}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Calendar Preview Section */}
      <section className="bg-background px-4 py-12 sm:px-6 lg:px-20 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">本周财报预告</h2>
            <Link 
              href="/calendar" 
              className="text-sm font-medium text-[#818CF8] hover:text-[#6366F1] transition-colors"
            >
              查看完整日历 →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <CalendarEmptyState 
              title="加载失败" 
              description="无法获取财报日历数据"
            />
          ) : upcomingEarnings.length === 0 ? (
            <CalendarEmptyState 
              title="暂无即将发布的财报" 
              description="未来7天内没有 scheduled 的财报发布"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEarnings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-[#22C55E]/30 bg-[#111111] p-4 transition-colors hover:bg-[#1A1A1A]"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <span className="text-sm font-bold text-emerald-400">
                      {formatDate(item.date).split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {item.companyName}
                    </p>
                    <p className="text-sm text-[#71717A]">
                      {item.symbol} · Q{item.fiscalQuarter} FY{item.fiscalYear}
                    </p>
                  </div>
                  <span className="text-sm text-emerald-400 whitespace-nowrap">
                    {formatDate(item.date).split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <SubscribeForm />
    </div>
  );
}
