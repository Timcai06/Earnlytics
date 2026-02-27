"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AppleIcon } from "@/components/icons";
import HorizontalGlow from "@/components/ui/HorizontalGlow";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { NoDataState } from "@/components/ui/EmptyState";
import { ViewportRender } from "@/components/performance";
import {
  HomeCalendarEvent,
  HomeEarningsWithCompany,
  HomePageDataResult,
} from "./home-data";

const MarketTicker = dynamic(() => import("@/components/home/MarketTicker"), {
  loading: () => <div className="h-[46px] w-full border-b border-white/5 bg-background/50" />,
});

const HeroSearch = dynamic(() => import("@/components/home/HeroSearch"), {
  loading: () => (
    <div className="w-full max-w-3xl space-y-3">
      <Skeleton variant="rounded" height={52} className="w-full rounded-2xl" />
      <div className="flex justify-center gap-2">
        <Skeleton variant="text" width={90} height={24} className="rounded-full" />
        <Skeleton variant="text" width={84} height={24} className="rounded-full" />
        <Skeleton variant="text" width={96} height={24} className="rounded-full" />
      </div>
    </div>
  ),
});

const HeroStats = dynamic(() => import("@/components/home/HeroStats"), {
  loading: () => (
    <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[156px] rounded-2xl border border-white/5 bg-surface/40 p-4 md:p-6"
        >
          <Skeleton variant="rounded" width={44} height={44} className="mb-3 rounded-xl" />
          <Skeleton variant="text" width="72%" height={30} className="mb-2" />
          <Skeleton variant="text" width="88%" height={14} />
        </div>
      ))}
    </div>
  ),
});

const EarningsCard = dynamic(() => import("@/components/home/EarningsCard"));

const CalendarTimeline = dynamic(() => import("@/components/home/CalendarTimeline"), {
  loading: () => <div className="h-[420px] rounded-2xl border border-white/10 bg-surface/20" />,
});

const SubscribeForm = dynamic(() => import("@/components/home/SubscribeForm"), {
  loading: () => <div className="h-[220px] w-full" />,
});

function EarningsCardsFallback({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <CardSkeleton key={index} className="h-[238px] rounded-2xl border-white/5 bg-surface/50" />
        ))}
      </div>
      <div className="flex justify-center">
        <Skeleton variant="text" width={120} height={34} className="rounded-full" />
      </div>
    </div>
  );
}

function formatCurrency(value: number | null): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

interface HomePageClientProps {
  initialData: HomePageDataResult | null;
}

export default function HomePageClient({ initialData }: HomePageClientProps) {
  const [visibleEarningsCount, setVisibleEarningsCount] = useState(4);
  const cardLogo = useMemo(() => <AppleIcon className="h-6 w-6" />, []);
  const latestEarnings: HomeEarningsWithCompany[] = useMemo(
    () => initialData?.latestEarnings ?? [],
    [initialData]
  );
  const upcomingEarnings: HomeCalendarEvent[] = useMemo(
    () => initialData?.upcomingEarnings ?? [],
    [initialData]
  );
  const revenueHistoryMap: Record<number, number[]> = useMemo(
    () => initialData?.revenueHistoryMap ?? {},
    [initialData]
  );
  const loading = !initialData;
  const error = initialData ? null : "加载数据失败，请重试";
  const displayedEarnings = latestEarnings.slice(0, visibleEarningsCount);
  const hasMoreEarnings = latestEarnings.length > visibleEarningsCount;
  const earningsCardModels = useMemo(
    () =>
      displayedEarnings.map((item) => ({
        id: item.id,
        companyName: item.companies?.name || "Unknown",
        ticker: item.companies?.symbol || "",
        quarter: item.fiscal_quarter.toString(),
        fiscalYear: item.fiscal_year,
        reportDate: item.report_date,
        revenue: formatCurrency(item.revenue),
        revenueGrowth: item.revenue_yoy_growth,
        eps: item.eps ? `$${item.eps}` : "N/A",
        epsSurprise: item.eps_surprise,
        revenueHistory: revenueHistoryMap[item.company_id],
      })),
    [displayedEarnings, revenueHistoryMap]
  );

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

            <ViewportRender
              rootMargin="280px 0px"
              fallback={<EarningsCardsFallback count={4} />}
            >
              {loading ? (
                <EarningsCardsFallback count={4} />
              ) : error ? (
                <NoDataState title="加载失败" description={error} />
              ) : latestEarnings.length === 0 ? (
                <NoDataState title="暂无数据" description="近期没有财报发布" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {earningsCardModels.map((item) => (
                      <EarningsCard
                        key={item.id}
                        companyName={item.companyName}
                        ticker={item.ticker}
                        quarter={item.quarter}
                        fiscalYear={item.fiscalYear}
                        reportDate={item.reportDate}
                        revenue={item.revenue}
                        revenueGrowth={item.revenueGrowth}
                        eps={item.eps}
                        epsSurprise={item.epsSurprise}
                        revenueHistory={item.revenueHistory}
                        logo={cardLogo}
                      />
                    ))}
                  </div>
                  {hasMoreEarnings ? (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleEarningsCount((count) =>
                            Math.min(count + 4, latestEarnings.length)
                          )
                        }
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        加载更多财报
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </ViewportRender>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                财报日历
              </h2>
              <Link
                href="/calendar"
                prefetch={false}
                className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all duration-200"
              >
                完整日历
              </Link>
            </div>
            <ViewportRender
              rootMargin="260px 0px"
              fallback={<div className="h-[420px] rounded-2xl border border-white/10 bg-surface/20" />}
            >
              <CalendarTimeline events={upcomingEarnings} />
            </ViewportRender>
          </div>
        </div>
      </main>

      <ViewportRender rootMargin="300px 0px" fallback={<div className="h-[220px] w-full" />}>
        <SubscribeForm />
      </ViewportRender>
    </div>
  );
}
