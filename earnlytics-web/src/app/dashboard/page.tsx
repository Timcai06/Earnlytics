import { supabase } from "@/lib/supabase";
import { Sparkles } from "lucide-react";
import DashboardClient from "./DashboardClient";
import type { Company } from "@/types/database";

interface InvestmentRecommendation {
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

async function getInvestmentRecommendations(): Promise<InvestmentRecommendation[]> {
  // First, get the latest ai_analyses with their earnings_id
  const { data: analyses, error } = await supabase
    .from("ai_analyses")
    .select("id, earnings_id, summary, highlights, concerns, sentiment, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !analyses) {
    console.error("Error fetching recommendations:", error);
    return [];
  }

  // Get all earnings_ids
  const earningsIds = analyses.map(a => a.earnings_id).filter(Boolean);

  if (earningsIds.length === 0) {
    return [];
  }

  // Fetch earnings data
  const { data: earnings, error: earningsError } = await supabase
    .from("earnings")
    .select("id, company_id")
    .in("id", earningsIds);

  if (earningsError) {
    console.error("Error fetching earnings:", earningsError);
    return [];
  }

  // Get all company_ids from earnings
  const companyIds = earnings?.map(e => e.company_id).filter(Boolean) || [];

  if (companyIds.length === 0) {
    return [];
  }

  // Fetch companies data
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, symbol, name")
    .in("id", companyIds);

  if (companiesError) {
    console.error("Error fetching companies:", companiesError);
    return [];
  }

  // Create maps for quick lookup
  const earningsMap = new Map();
  earnings?.forEach(e => {
    earningsMap.set(e.id, e);
  });

  const companiesMap = new Map();
  companies?.forEach(c => {
    companiesMap.set(c.id, c);
  });

  return analyses.map((analysis) => {
    const earning = earningsMap.get(analysis.earnings_id);
    const company = earning ? companiesMap.get(earning.company_id) : undefined;
    const highlights = analysis?.highlights || [];
    const sentiment = analysis?.sentiment || "neutral";

    return {
      symbol: company?.symbol || '',
      name: company?.name || '',
      rating: sentiment === "positive" ? "buy" : sentiment === "negative" ? "sell" : "hold",
      confidence: "medium",
      targetPriceLow: 0,
      targetPriceHigh: 0,
      currentPrice: 0,
      keyPoints: Array.isArray(highlights) ? highlights.slice(0, 3) : [],
      updatedAt: analysis.created_at,
    };
  });
}

async function getCompanies(): Promise<Company[]> {
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

export default async function DashboardPage() {
  const [recommendations, companies] = await Promise.all([
    getInvestmentRecommendations(),
    getCompanies(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          投资仪表盘
        </h1>
        <p className="text-muted-foreground">
          AI驱动的投资决策辅助系统 - 基于五维度分析框架
        </p>
      </div>

      <DashboardClient 
        initialRecommendations={recommendations} 
        companies={companies} 
      />
    </div>
  );
}
