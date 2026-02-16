"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AppleIcon } from "@/components/icons";
import SubscribeForm from "@/components/sections/SubscribeForm";
import HorizontalGlow from "@/components/ui/horizontal-glow";
import { EarningsListSkeleton } from "@/components/ui/skeleton";
import { NoDataState } from "@/components/ui/empty-state";
import HeroSearch from "@/components/home/HeroSearch";
import HeroStats from "@/components/home/HeroStats";
import MarketTicker from "@/components/home/MarketTicker";
import EarningsCard from "@/components/home/EarningsCard";
import CalendarTimeline from "@/components/home/CalendarTimeline";

interface EarningsWithCompany {
  id: number;
  company_id: number;
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

export default function HomePageClient() {
  const [latestEarnings, setLatestEarnings] = useState<EarningsWithCompany[]>([]);
  const [upcomingEarnings, setUpcomingEarnings] = useState<CalendarEvent[]>([]);
  const [revenueHistoryMap, setRevenueHistoryMap] = useState<Record<number, number[]>>({});
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
            company_id,
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
          .limit(6);

        if (latestError) throw latestError;

        const today = new Date();
        const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

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
          .limit(10);

        if (upcomingError) throw upcomingError;

        const mappedLatest = latestData
          ?.filter((item) => item.companies !== null && item.revenue > 0)
          .map((item) => ({
            id: item.id,
            company_id: item.company_id,
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

        const companyIds = [...new Set(mappedLatest.map(e => e.company_id))];
        const historyMap: Record<number, number[]> = {};
        if (companyIds.length > 0) {
          const { data: historyData } = await supabase
            .from('earnings')
            .select('company_id, revenue, fiscal_year, fiscal_quarter')
            .in('company_id', companyIds)
            .not('revenue', 'is', null)
            .order('fiscal_year', { ascending: true })
            .order('fiscal_quarter', { ascending: true });

          if (historyData) {
            for (const row of historyData) {
              if (!historyMap[row.company_id]) historyMap[row.company_id] = [];
              historyMap[row.company_id].push(row.revenue);
            }
          }
        }
        setRevenueHistoryMap(historyMap);

        const mappedUpcoming = upcomingData
          ?.filter((e) => e.companies !== null)
          .map((e) => {
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
      } catch (e: unknown) {
        console.error('Error fetching data:', e);
        setError('加载数据失败，请重试');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketTicker />

      <section className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center">
          <div className="relative z-10 w-full flex flex-col items-center gap-6">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
              金融指挥中心
            </h1>
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="max-w-xl text-lg text-text-secondary">
                实时洞察 • 深度分析 • 智能决策
              </p>

              <div className="relative w-full h-1 mx-auto opacity-80">
                <HorizontalGlow />
              </div>
            </div>

            <div className="w-full mt-10 flex flex-col items-center gap-20">
              <HeroSearch />
              <HeroStats />
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  最新财报
                </h2>
                <Link
                  href="/companies"
                  className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all duration-200"
                >
                  全部公司
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EarningsListSkeleton count={4} />
              </div>
            ) : error ? (
              <NoDataState title="加载失败" description={error} />
            ) : latestEarnings.length === 0 ? (
              <NoDataState title="暂无数据" description="近期没有财报发布" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestEarnings.map((item) => (
                  <EarningsCard
                    key={item.id}
                    companyName={item.companies?.name || "Unknown"}
                    ticker={item.companies?.symbol || ""}
                    quarter={item.fiscal_quarter.toString()}
                    fiscalYear={item.fiscal_year}
                    reportDate={item.report_date}
                    revenue={formatCurrency(item.revenue)}
                    revenueGrowth={item.revenue_yoy_growth}
                    eps={item.eps ? `$${item.eps}` : "N/A"}
                    epsSurprise={item.eps_surprise}
                    revenueHistory={revenueHistoryMap[item.company_id]}
                    logo={<AppleIcon className="h-6 w-6" />}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                财报日历
              </h2>
              <Link
                href="/calendar"
                className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all duration-200"
              >
                完整日历
              </Link>
            </div>
            <CalendarTimeline events={upcomingEarnings} />
          </div>
        </div>
      </main>

      <SubscribeForm />
    </div>
  );
}
