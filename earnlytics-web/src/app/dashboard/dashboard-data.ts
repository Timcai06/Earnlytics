import { supabase } from "@/lib/supabase";
import type { Company } from "@/types/database";

export interface InvestmentRecommendation {
  symbol: string;
  name: string;
  rating: string;
  confidence: string;
  targetPriceLow: number;
  targetPriceHigh: number;
  currentPrice: number;
  keyPoints: string[];
  updatedAt: string;
}

export async function getInvestmentRecommendations(): Promise<InvestmentRecommendation[]> {
  if (!supabase) return [];

  const { data: analyses, error } = await supabase
    .from("ai_analyses")
    .select("id, earnings_id, summary, highlights, concerns, sentiment, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !analyses) {
    console.error("Error fetching recommendations:", error);
    return [];
  }

  const earningsIds = analyses.map((analysis) => analysis.earnings_id).filter(Boolean);
  if (earningsIds.length === 0) {
    return [];
  }

  const { data: earnings, error: earningsError } = await supabase
    .from("earnings")
    .select("id, company_id")
    .in("id", earningsIds);

  if (earningsError) {
    console.error("Error fetching earnings:", earningsError);
    return [];
  }

  const companyIds = earnings?.map((earning) => earning.company_id).filter(Boolean) || [];
  if (companyIds.length === 0) {
    return [];
  }

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, symbol, name")
    .in("id", companyIds);

  if (companiesError) {
    console.error("Error fetching companies:", companiesError);
    return [];
  }

  const earningsMap = new Map();
  earnings?.forEach((earning) => {
    earningsMap.set(earning.id, earning);
  });

  const companiesMap = new Map();
  companies?.forEach((company) => {
    companiesMap.set(company.id, company);
  });

  const symbolList = [
    ...new Set(
      analyses
        .map((analysis) => {
          const earning = earningsMap.get(analysis.earnings_id);
          const company = earning ? companiesMap.get(earning.company_id) : undefined;
          return company?.symbol;
        })
        .filter(Boolean) as string[],
    ),
  ];

  const stockPriceMap = new Map<string, { price: number; change_percent: number }>();

  if (symbolList.length > 0) {
    const { data: prices } = await supabase
      .from("stock_prices")
      .select("symbol, price, change_percent")
      .in("symbol", symbolList)
      .order("timestamp", { ascending: false });

    if (prices) {
      for (const price of prices) {
        if (!stockPriceMap.has(price.symbol)) {
          stockPriceMap.set(price.symbol, { price: price.price, change_percent: price.change_percent });
        }
      }
    }
  }

  return analyses.map((analysis) => {
    const earning = earningsMap.get(analysis.earnings_id);
    const company = earning ? companiesMap.get(earning.company_id) : undefined;
    const highlights = analysis?.highlights || [];
    const sentiment = analysis?.sentiment || "neutral";
    const symbol = company?.symbol || "";
    const stockData = stockPriceMap.get(symbol);
    const currentPrice = stockData?.price || 0;

    let targetPriceLow = 0;
    let targetPriceHigh = 0;
    if (currentPrice > 0) {
      if (sentiment === "positive") {
        targetPriceLow = currentPrice * 1.05;
        targetPriceHigh = currentPrice * 1.25;
      } else if (sentiment === "negative") {
        targetPriceLow = currentPrice * 0.75;
        targetPriceHigh = currentPrice * 0.95;
      } else {
        targetPriceLow = currentPrice * 0.9;
        targetPriceHigh = currentPrice * 1.1;
      }
    }

    let confidence = "low";
    if (currentPrice > 0 && analysis) {
      confidence = "high";
    } else if (currentPrice > 0 || analysis) {
      confidence = "medium";
    }

    return {
      symbol,
      name: company?.name || "",
      rating: sentiment === "positive" ? "buy" : sentiment === "negative" ? "sell" : "hold",
      confidence,
      targetPriceLow,
      targetPriceHigh,
      currentPrice,
      keyPoints: Array.isArray(highlights) ? highlights.slice(0, 3) : [],
      updatedAt: analysis.created_at,
    };
  });
}

export async function getDashboardCompanies(): Promise<Company[]> {
  if (!supabase) return [];

  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("symbol", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }

  return companies || [];
}
