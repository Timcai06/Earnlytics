import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AppleIcon } from "@/components/icons";
import SubscribeForm from "@/components/sections/SubscribeForm";

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

async function getLatestEarnings(): Promise<EarningsWithCompany[]> {
  try {
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching latest earnings:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const mapped = data
      .filter((item: any) => item.companies !== null)
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
      }));

    return mapped;
  } catch (e) {
    console.error('Exception fetching latest earnings:', e);
    return [];
  }
}

async function getUpcomingEarnings(): Promise<CalendarEvent[]> {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching upcoming earnings:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data
      .filter((e: any) => e.companies !== null)
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
      });
  } catch (e) {
    console.error('Exception fetching upcoming earnings:', e);
    return [];
  }
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
    return { text: '超预期', color: 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' };
  }
  if (sentiment === 'positive') {
    return { text: '积极', color: 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' };
  }
  if (sentiment === 'negative') {
    return { text: '消极', color: 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]' };
  }
  return { text: '中性', color: 'bg-[rgba(161,161,170,0.15)] text-[#A1A1AA]' };
}

export default async function HomePage() {
  const [latestEarnings, upcomingEarnings] = await Promise.all([
    getLatestEarnings(),
    getUpcomingEarnings(),
  ]);

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
            {latestEarnings.length === 0 ? (
              <div className="rounded-xl border border-[#3F3F46] bg-surface-secondary p-8 text-center">
                <p className="text-[#A1A1AA]">暂无财报数据</p>
              </div>
            ) : (
              latestEarnings.map((item) => {
                const badge = getEarningsBadge(item.eps_surprise, item.ai_analyses?.sentiment || null);
                return (
                  <Link
                    key={item.id}
                    href={`/earnings/${item.companies?.symbol?.toLowerCase()}`}
                    className="flex items-center gap-6 rounded-xl border border-[#6366F1] bg-surface-secondary p-6 transition-colors hover:bg-surface"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black text-white">
                      <AppleIcon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{item.companies?.name}</h3>
                      <p className="text-sm text-[#A1A1AA]">
                        Q{item.fiscal_quarter} FY{item.fiscal_year} | {item.report_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs text-[#64748B]">营收</p>
                        <p className="text-lg font-semibold text-[#10B981]">{formatCurrency(item.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B]">EPS</p>
                        <p className="text-lg font-semibold text-[#10B981]">{item.eps ? `$${item.eps}` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B]">同比</p>
                        <p className="text-lg font-semibold text-[#10B981]">
                          {item.revenue_yoy_growth ? `+${item.revenue_yoy_growth}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${badge.color}`}>
                      {badge.text}
                    </span>
                  </Link>
                );
              })
            )}
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
            {upcomingEarnings.length === 0 ? (
              <div className="rounded-xl border border-[#3F3F46] bg-surface-secondary p-8 text-center">
                <p className="text-[#A1A1AA]">暂无即将发布的财报</p>
              </div>
            ) : (
              upcomingEarnings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-5 rounded-xl border border-[#22C55E] bg-surface-secondary p-6"
                >
                  <span className="text-base font-semibold text-primary">{formatDate(item.date)}</span>
                  <p className="text-lg font-medium text-white">
                    {item.companyName} ({item.symbol}) - Q{item.fiscalQuarter} FY{item.fiscalYear}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <SubscribeForm />
    </div>
  );
}
