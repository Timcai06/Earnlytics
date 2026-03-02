import { supabase } from "@/lib/supabase";
import { getLatestStockPrices } from "@/lib/stock-price-service";

export interface HomeEarningsWithCompany {
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
    sentiment: "positive" | "neutral" | "negative" | null;
  } | null;
}

export interface HomeCalendarEvent {
  id: number;
  date: string;
  symbol: string;
  companyName: string;
  fiscalYear: number;
  fiscalQuarter: number;
}

export interface HomePageDataResult {
  latestEarnings: HomeEarningsWithCompany[];
  upcomingEarnings: HomeCalendarEvent[];
  revenueHistoryMap: Record<number, number[]>;
  marketTicker: HomeTickerItem[];
}

export interface HomeTickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

const HOME_TICKER_SYMBOLS = [
  "AAPL",
  "NVDA",
  "MSFT",
  "TSLA",
  "GOOGL",
  "META",
  "AMZN",
  "AMD",
  "INTC",
  "NFLX",
];

export async function fetchHomePageData(): Promise<HomePageDataResult> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const tickerPromise = getLatestStockPrices(HOME_TICKER_SYMBOLS).catch(() => new Map());
  const [latestResult, upcomingResult] = await Promise.all([
    supabase
      .from("earnings")
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
      .not("revenue", "is", null)
      .order("report_date", { ascending: false })
      .limit(6),
    supabase
      .from("earnings")
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
      .gte("report_date", today.toISOString().split("T")[0])
      .lte("report_date", nextWeek.toISOString().split("T")[0])
      .order("report_date", { ascending: true })
      .limit(10),
  ]);

  const { data: latestData, error: latestError } = latestResult;
  const { data: upcomingData, error: upcomingError } = upcomingResult;

  if (latestError) {
    throw latestError;
  }

  if (upcomingError) {
    throw upcomingError;
  }

  const mappedLatest =
    latestData
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

  const companyIds = [...new Set(mappedLatest.map((earning) => earning.company_id))];
  const historyMap: Record<number, number[]> = {};

  if (companyIds.length > 0) {
    const { data: historyData } = await supabase
      .from("earnings")
      .select("company_id, revenue, fiscal_year, fiscal_quarter")
      .in("company_id", companyIds)
      .not("revenue", "is", null)
      .order("fiscal_year", { ascending: true })
      .order("fiscal_quarter", { ascending: true });

    if (historyData) {
      for (const row of historyData) {
        if (!historyMap[row.company_id]) {
          historyMap[row.company_id] = [];
        }
        historyMap[row.company_id].push(row.revenue);
      }
    }
  }

  const mappedUpcoming =
    upcomingData
      ?.filter((event) => event.companies !== null)
      .map((event) => {
        const company = Array.isArray(event.companies) ? event.companies[0] : event.companies;
        return {
          id: event.id,
          date: event.report_date,
          symbol: company?.symbol || "",
          companyName: company?.name || "",
          fiscalYear: event.fiscal_year,
          fiscalQuarter: event.fiscal_quarter,
        };
      }) || [];

  const tickerMap = await tickerPromise;
  const marketTicker = HOME_TICKER_SYMBOLS.map((symbol) => {
    const ticker = tickerMap.get(symbol);
    const change = ticker?.change ?? 0;
    const changePercent = ticker?.change_percent ?? 0;
    return {
      symbol,
      price: ticker?.price ?? 0,
      change,
      changePercent,
      isPositive: changePercent >= 0,
    };
  }).filter((item) => item.price > 0);

  return {
    latestEarnings: mappedLatest,
    upcomingEarnings: mappedUpcoming,
    revenueHistoryMap: historyMap,
    marketTicker,
  };
}
