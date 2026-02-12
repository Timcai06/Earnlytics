import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentRatingCard, FinancialHealthScorecard, DocumentViewer } from "@/components/investment";
import { ArrowLeft, TrendingUp, Shield, Target, AlertTriangle, Sparkles } from "lucide-react";

interface AnalysisData {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  rating: string;
  confidence: string;
  targetPrice: { low: number; high: number };
  keyPoints: string[];
  risks: string[];
  catalysts: string[];
  financialQuality: {
    score: number;
    roeDuPont: {
      netMargin: number;
      assetTurnover: number;
      equityMultiplier: number;
    };
    cashFlowHealth: "healthy" | "moderate" | "concerning";
  };
  growth: {
    stage: "introduction" | "growth" | "maturity" | "decline";
    revenueCAGR3Y: number;
  };
  moat: {
    strength: "wide" | "narrow" | "none";
    porterScore: number;
  };
  valuation: {
    assessment: "undervalued" | "fair" | "overvalued";
    pePercentile: number;
  };
  earningsId: string;
  filingType: string;
  filingDate: string;
}

async function getAnalysisData(symbol: string, earningsId?: string): Promise<AnalysisData | null> {
  // First get the company by symbol
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, symbol, name, sector")
    .ilike("symbol", symbol)
    .single();

  if (companyError || !company) {
    console.error("Error fetching company:", companyError);
    return null;
  }

  let latestEarning;

  // If earnings_id is provided, fetch that specific record
  if (earningsId) {
    const { data: earning, error: earningError } = await supabase
      .from("earnings")
      .select("id, fiscal_year, fiscal_quarter, report_date, company_id")
      .eq("id", parseInt(earningsId))
      .single();

    if (!earningError && earning) {
      latestEarning = earning;
    }
  }

  // Fallback: Get the latest earnings for this company if no specific earnings_id or not found
  if (!latestEarning) {
    const { data: fallbackEarning, error: earningError } = await supabase
      .from("earnings")
      .select("id, fiscal_year, fiscal_quarter, report_date, company_id")
      .eq("company_id", company.id)
      .order("fiscal_year", { ascending: false })
      .order("fiscal_quarter", { ascending: false })
      .limit(1)
      .single();

    if (earningError || !fallbackEarning) {
      console.error("Error fetching earnings:", earningError);
      return null;
    }
    latestEarning = fallbackEarning;
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("ai_analyses")
    .select("summary, highlights, concerns, sentiment")
    .eq("earnings_id", latestEarning.id)
    .single();

  if (analysisError) {
    console.error("Error fetching analysis:", analysisError);
  }

  // Map database columns to the expected format
  const highlights = analysis?.highlights || [];
  const concerns = analysis?.concerns || [];
  const sentiment = analysis?.sentiment || "neutral";

  return {
    symbol: company.symbol,
    name: company.name,
    sector: company.sector,
    currentPrice: 0,
    rating: sentiment === "positive" ? "buy" : sentiment === "negative" ? "sell" : "hold",
    confidence: "medium",
    targetPrice: { low: 0, high: 0 },
    keyPoints: highlights.slice(0, 5),
    risks: concerns.slice(0, 3),
    catalysts: [],
    financialQuality: {
      score: 50,
      roeDuPont: {
        netMargin: 0.15,
        assetTurnover: 0.5,
        equityMultiplier: 2.0,
      },
      cashFlowHealth: "moderate" as const,
    },
    growth: {
      stage: "maturity" as const,
      revenueCAGR3Y: 0.1,
    },
    moat: {
      strength: "narrow" as const,
      porterScore: 50,
    },
    valuation: {
      assessment: "fair" as const,
      pePercentile: 50,
    },
    earningsId: latestEarning.id,
    filingType: `FY${latestEarning.fiscal_year} Q${latestEarning.fiscal_quarter}`,
    filingDate: latestEarning.report_date,
  };
}

export default async function AnalysisPage({ params, searchParams }: { params: Promise<{ symbol: string }>; searchParams: Promise<{ earnings_id?: string }> }) {
  const { symbol } = await params;
  const { earnings_id } = await searchParams;
  const data = await getAnalysisData(symbol, earnings_id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回仪表盘
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{data.symbol}</h1>
              <Badge variant="outline">{data.name}</Badge>
              <Badge>{data.sector}</Badge>
            </div>
            <p className="text-muted-foreground">
              基于 {data.filingType} 财报的深度分析
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${data.currentPrice.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">当前股价</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <InvestmentRatingCard
            symbol={data.symbol}
            rating={data.rating as "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"}
            confidence={data.confidence as "high" | "medium" | "low"}
            targetPrice={data.targetPrice}
            currentPrice={data.currentPrice}
            keyPoints={data.keyPoints}
          />
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">总览</TabsTrigger>
              <TabsTrigger value="financial" className="text-xs sm:text-sm py-2">财务质量</TabsTrigger>
              <TabsTrigger value="growth" className="text-xs sm:text-sm py-2">成长性</TabsTrigger>
              <TabsTrigger value="moat" className="text-xs sm:text-sm py-2">护城河</TabsTrigger>
              <TabsTrigger value="valuation" className="text-xs sm:text-sm py-2">估值</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    五维度分析概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{data.financialQuality.score}</div>
                      <div className="text-xs text-muted-foreground">财务质量</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      <div className="text-2xl font-bold capitalize">{data.growth.stage === 'introduction' ? '导入期' : data.growth.stage === 'growth' ? '成长期' : data.growth.stage === 'maturity' ? '成熟期' : '衰退期'}</div>
                      <div className="text-xs text-muted-foreground">成长阶段</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold capitalize">{data.moat.strength === 'wide' ? '宽' : data.moat.strength === 'narrow' ? '窄' : '无'}</div>
                      <div className="text-xs text-muted-foreground">护城河</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <div className="text-2xl font-bold capitalize">{data.valuation.assessment === 'undervalued' ? '低估' : data.valuation.assessment === 'fair' ? '合理' : '高估'}</div>
                      <div className="text-xs text-muted-foreground">估值水平</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>风险因素</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.risks.slice(0, 3).map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>潜在催化剂</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.catalysts.slice(0, 3).map((catalyst, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <FinancialHealthScorecard
                score={data.financialQuality.score}
                roeDuPont={data.financialQuality.roeDuPont}
                cashFlowHealth={data.financialQuality.cashFlowHealth}
              />
            </TabsContent>

            <TabsContent value="growth">
              <Card>
                <CardHeader>
                  <CardTitle>成长分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span>成长阶段</span>
                    <Badge>
                      {data.growth.stage === 'introduction' ? '导入期' : data.growth.stage === 'growth' ? '成长期' : data.growth.stage === 'maturity' ? '成熟期' : '衰退期'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span>3年营收复合增长率 (CAGR)</span>
                    <span className="text-xl font-bold">{(data.growth.revenueCAGR3Y * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moat">
              <Card>
                <CardHeader>
                  <CardTitle>护城河分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span>护城河强度</span>
                    <Badge>
                      {data.moat.strength === 'wide' ? '宽护城河' : data.moat.strength === 'narrow' ? '窄护城河' : '无明显护城河'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span>波特五力评分</span>
                    <span className="text-xl font-bold">{data.moat.porterScore}/100</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valuation">
              <Card>
                <CardHeader>
                  <CardTitle>估值分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span>估值评估</span>
                    <Badge>
                      {data.valuation.assessment === 'undervalued' ? '低估' : data.valuation.assessment === 'fair' ? '合理' : '高估'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span>P/E历史分位数</span>
                    <span className="text-xl font-bold">{data.valuation.pePercentile.toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">原始财报文档</h2>
        <DocumentViewer
          documentId={data.earningsId}
          symbol={data.symbol}
          filingType={data.filingType}
          filingDate={data.filingDate}
          aiSummary={{
            highlights: data.keyPoints,
            keyMetrics: [
              { label: "目标价下限", value: `$${data.targetPrice.low.toFixed(2)}` },
              { label: "目标价上限", value: `$${data.targetPrice.high.toFixed(2)}` },
            ],
            sentiment: data.rating === 'buy' || data.rating === 'strong_buy' ? 'positive' : data.rating === 'sell' || data.rating === 'strong_sell' ? 'negative' : 'neutral',
          }}
        />
      </div>
    </div>
  );
}
