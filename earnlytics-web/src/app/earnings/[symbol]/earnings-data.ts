import { supabase } from "@/lib/supabase";

export interface EarningWithAnalysis {
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
  data_source: "fmp" | "sec" | "sample" | null;
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
    sentiment: "positive" | "neutral" | "negative" | null;
    created_at: string | null;
  } | null;
}

export interface QuarterSentiment {
  quarter: string;
  fiscal_year: number;
  fiscal_quarter: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  revenue: number | null;
  eps: number | null;
  revenue_yoy_growth: number | null;
  eps_surprise: number | null;
  ai_summary_preview: string;
  earning_id: number;
  report_date: string;
}

export interface TrendAnalysis {
  positive_streak: number;
  negative_streak: number;
  sentiment_changes: number;
  overall_trend: "improving" | "declining" | "stable";
}

export interface SentimentHistoryData {
  quarters: QuarterSentiment[];
  trend_analysis: TrendAnalysis;
}

export interface EarningsPageInitialData {
  symbol: string;
  earnings: EarningWithAnalysis | null;
  earningsHistory: EarningWithAnalysis[];
  sentimentHistory: SentimentHistoryData | null;
}

function normalizeEarning(row: Record<string, unknown>): EarningWithAnalysis | null {
  const companyRaw = row.companies;
  const company = Array.isArray(companyRaw)
    ? (companyRaw[0] as Record<string, unknown> | undefined)
    : (companyRaw as Record<string, unknown> | undefined);
  if (!company) return null;

  const analysisRaw = row.ai_analyses;
  const analysis = Array.isArray(analysisRaw)
    ? (analysisRaw[0] as Record<string, unknown> | undefined)
    : (analysisRaw as Record<string, unknown> | undefined);

  return {
    id: Number(row.id),
    company_id: Number(row.company_id),
    fiscal_year: Number(row.fiscal_year),
    fiscal_quarter: Number(row.fiscal_quarter),
    report_date: String(row.report_date || ""),
    revenue: row.revenue === null ? null : Number(row.revenue),
    revenue_yoy_growth: row.revenue_yoy_growth === null ? null : Number(row.revenue_yoy_growth),
    eps: row.eps === null ? null : Number(row.eps),
    eps_estimate: row.eps_estimate === null ? null : Number(row.eps_estimate),
    eps_surprise: row.eps_surprise === null ? null : Number(row.eps_surprise),
    net_income: row.net_income === null ? null : Number(row.net_income),
    is_analyzed: Boolean(row.is_analyzed),
    data_source: (row.data_source as "fmp" | "sec" | "sample" | null) ?? null,
    companies: {
      id: Number(company.id),
      symbol: String(company.symbol || ""),
      name: String(company.name || ""),
      sector: company.sector ? String(company.sector) : null,
    },
    ai_analyses: analysis
      ? {
          id: Number(analysis.id),
          summary: String(analysis.summary || ""),
          highlights: Array.isArray(analysis.highlights)
            ? (analysis.highlights as string[])
            : null,
          concerns: Array.isArray(analysis.concerns)
            ? (analysis.concerns as string[])
            : null,
          sentiment: (analysis.sentiment as "positive" | "neutral" | "negative" | null) ?? null,
          created_at: analysis.created_at ? String(analysis.created_at) : null,
        }
      : null,
  };
}

function calculateTrendAnalysis(quarters: QuarterSentiment[]): TrendAnalysis {
  if (quarters.length === 0) {
    return {
      positive_streak: 0,
      negative_streak: 0,
      sentiment_changes: 0,
      overall_trend: "stable",
    };
  }

  let positiveStreak = 0;
  let negativeStreak = 0;
  let sentimentChanges = 0;
  let currentStreak = 0;
  let currentStreakType: "positive" | "negative" | null = null;

  for (let i = 0; i < quarters.length; i++) {
    const sentiment = quarters[i].sentiment;

    if (i > 0 && quarters[i - 1].sentiment !== sentiment && sentiment && quarters[i - 1].sentiment) {
      sentimentChanges++;
    }

    if (sentiment === "positive") {
      if (currentStreakType === "positive") {
        currentStreak++;
      } else {
        currentStreakType = "positive";
        currentStreak = 1;
      }
      positiveStreak = Math.max(positiveStreak, currentStreak);
    } else if (sentiment === "negative") {
      if (currentStreakType === "negative") {
        currentStreak++;
      } else {
        currentStreakType = "negative";
        currentStreak = 1;
      }
      negativeStreak = Math.max(negativeStreak, currentStreak);
    } else {
      currentStreakType = null;
      currentStreak = 0;
    }
  }

  const recent = quarters.slice(-4).map((item) => {
    if (item.sentiment === "positive") return 1;
    if (item.sentiment === "negative") return -1;
    return 0;
  });
  const avgRecent = recent.reduce<number>((sum, value) => sum + value, 0) / Math.max(1, recent.length);
  const overall_trend: "improving" | "declining" | "stable" =
    avgRecent > 0.3 ? "improving" : avgRecent < -0.3 ? "declining" : "stable";

  return {
    positive_streak: positiveStreak,
    negative_streak: negativeStreak,
    sentiment_changes: sentimentChanges,
    overall_trend,
  };
}

function buildSentimentHistory(history: EarningWithAnalysis[]): SentimentHistoryData | null {
  if (history.length === 0) return null;
  const latestEight = history.slice(0, 8);
  const quarters = [...latestEight]
    .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime())
    .map((item) => ({
      quarter: `Q${item.fiscal_quarter} ${item.fiscal_year}`,
      fiscal_year: item.fiscal_year,
      fiscal_quarter: item.fiscal_quarter,
      sentiment: item.ai_analyses?.sentiment || null,
      revenue: item.revenue,
      eps: item.eps,
      revenue_yoy_growth: item.revenue_yoy_growth,
      eps_surprise: item.eps_surprise,
      ai_summary_preview: item.ai_analyses?.summary
        ? `${item.ai_analyses.summary.slice(0, 100)}...`
        : "",
      earning_id: item.id,
      report_date: item.report_date,
    }));

  return {
    quarters,
    trend_analysis: calculateTrendAnalysis(quarters),
  };
}

const EARNINGS_SELECT = `
  id,
  company_id,
  fiscal_year,
  fiscal_quarter,
  report_date,
  revenue,
  revenue_yoy_growth,
  eps,
  eps_estimate,
  eps_surprise,
  net_income,
  is_analyzed,
  data_source,
  companies (
    id,
    symbol,
    name,
    sector
  ),
  ai_analyses (
    id,
    summary,
    highlights,
    concerns,
    sentiment,
    created_at
  )
`;

export async function fetchEarningsPageInitialData(
  symbol: string,
  initialEarningId?: string
): Promise<EarningsPageInitialData> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, symbol")
    .ilike("symbol", symbol)
    .single();

  if (companyError || !company) {
    return {
      symbol: symbol.toUpperCase(),
      earnings: null,
      earningsHistory: [],
      sentimentHistory: null,
    };
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("earnings")
    .select(EARNINGS_SELECT)
    .eq("company_id", company.id)
    .not("revenue", "is", null)
    .order("report_date", { ascending: false });

  if (historyError) {
    throw historyError;
  }

  const earningsHistory = (historyRows || [])
    .map((row) => normalizeEarning(row as Record<string, unknown>))
    .filter((row): row is EarningWithAnalysis => row !== null);

  let selectedEarning: EarningWithAnalysis | null = null;
  const parsedId = Number(initialEarningId);
  if (Number.isFinite(parsedId) && parsedId > 0) {
    const { data: selectedRow } = await supabase
      .from("earnings")
      .select(EARNINGS_SELECT)
      .eq("id", parsedId)
      .eq("company_id", company.id)
      .maybeSingle();
    if (selectedRow) {
      selectedEarning = normalizeEarning(selectedRow as Record<string, unknown>);
    }
  }

  const earnings = selectedEarning || earningsHistory[0] || null;

  return {
    symbol: String(company.symbol || symbol).toUpperCase(),
    earnings,
    earningsHistory,
    sentimentHistory: buildSentimentHistory(earningsHistory),
  };
}
