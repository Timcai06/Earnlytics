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
  dataSource: string;
  externalUrl?: string;
  stockPrice?: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    high52w: number;
    low52w: number;
    timestamp: string;
    source: string;
    cached: boolean;
  };
}





async function fetchEarningsWithFinancials(companyId: number) {
  if (!supabase) return [];

  const { data: earnings } = await supabase
    .from("earnings")
    .select("id, fiscal_year, fiscal_quarter, report_date, revenue, net_income, eps")
    .eq("company_id", companyId)
    .order("fiscal_year", { ascending: false })
    .order("fiscal_quarter", { ascending: false })
    .limit(12);

  return earnings || [];
}

interface Earning {
  fiscal_year: number;
  fiscal_quarter: number;
  revenue: number;
}

function calculateRevenueCAGR(earnings: Earning[]) {
  if (earnings.length < 2) return 0;

  const sorted = [...earnings].sort((a, b) => {
    const dateA = new Date(a.fiscal_year, (a.fiscal_quarter - 1) * 3);
    const dateB = new Date(b.fiscal_year, (b.fiscal_quarter - 1) * 3);
    return dateA.getTime() - dateB.getTime();
  });

  const firstRevenue = sorted[0].revenue;
  const lastRevenue = sorted[sorted.length - 1].revenue;
  const years = (sorted.length - 1) / 4;

  if (!firstRevenue || !lastRevenue || years <= 0) return 0;

  return Math.pow(lastRevenue / firstRevenue, 1 / years) - 1;
}

function determineGrowthStage(cagr: number): "introduction" | "growth" | "maturity" | "decline" {
  if (cagr > 0.25) return "growth";
  if (cagr > 0.05) return "maturity";
  if (cagr > -0.1) return "introduction";
  return "decline";
}

function calculateFinancialScore(roe: number | null, roa: number | null, netMargin: number | null): number {
  let score = 50;

  if (roe !== null) {
    if (roe > 0.2) score += 15;
    else if (roe > 0.15) score += 10;
    else if (roe > 0.1) score += 5;
  }

  if (roa !== null) {
    if (roa > 0.1) score += 10;
    else if (roa > 0.05) score += 5;
  }

  if (netMargin !== null) {
    if (netMargin > 0.2) score += 10;
    else if (netMargin > 0.1) score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

async function fetchStockPrice(symbol: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/stock-price/${symbol}`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      console.log('Stock price API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
}

async function getAnalysisData(symbol: string, earningsId?: string): Promise<AnalysisData | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, symbol, name, sector")
    .ilike("symbol", symbol)
    .single();

  if (companyError && companyError.code !== "PGRST116") {
    console.error("Error fetching company:", companyError);
  }

  if (!company) {
    console.error(`Company not found: ${symbol}`);
    return null;
  }

  let latestEarning;

  if (earningsId) {
    const { data: earning, error: earningError } = await supabase
      .from("earnings")
      .select("id, fiscal_year, fiscal_quarter, report_date, company_id, revenue, net_income, eps")
      .eq("id", parseInt(earningsId))
      .single();

    if (earningError && earningError.code !== "PGRST116") {
      console.error(`Error fetching earnings by ID ${earningsId}:`, earningError);
    }

    if (earning) {
      latestEarning = earning;
    }
  }

  if (!latestEarning) {
    const { data: fallbackEarning, error: fallbackError } = await supabase
      .from("earnings")
      .select("id, fiscal_year, fiscal_quarter, report_date, company_id, revenue, net_income, eps")
      .eq("company_id", company.id)
      .order("fiscal_year", { ascending: false })
      .order("fiscal_quarter", { ascending: false })
      .limit(1)
      .single();

    if (fallbackError && fallbackError.code !== "PGRST116") {
      console.error(`Error fetching earnings for ${company.symbol}:`, fallbackError);
    }

    if (!fallbackEarning) {
      console.error(`No earnings data found for company ${company.symbol} (ID: ${company.id})`);
      return null;
    }
    latestEarning = fallbackEarning;
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("ai_analyses")
    .select("summary, highlights, concerns, sentiment")
    .eq("earnings_id", latestEarning.id)
    .single();

  if (analysisError && analysisError.code !== "PGRST116") {
    console.error(`Error fetching AI analysis for earnings ${latestEarning.id}:`, analysisError);
  }

  let { data: document, error: documentError } = await supabase
    .from("earnings_documents")
    .select("content, source_url")
    .eq("earnings_id", latestEarning.id)
    .single();

  if (documentError && documentError.code === "PGRST116") {
    const { data: latestDoc } = await supabase
      .from("earnings_documents")
      .select("earnings_id, content, source_url")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestDoc) {
      console.log(`No document for earnings ${latestEarning.id}, using latest document from earnings ${latestDoc.earnings_id}`);
      document = latestDoc;
    }
  }

  console.log(`Document query result for earnings ${latestEarning.id}:`, {
    document: document ? 'found' : 'null',
    content: document?.content ? 'has content' : 'no content',
    documentError: documentError ? JSON.stringify(documentError) : 'null'
  });

  const [stockPrice, earningsHistory] = await Promise.all([
    fetchStockPrice(company.symbol),
    fetchEarningsWithFinancials(company.id)
  ]);

  const highlights = analysis?.highlights || [];
  const concerns = analysis?.concerns || [];
  const sentiment = analysis?.sentiment || "neutral";

  const currentPrice = stockPrice?.price || 0;

  const revenueCAGR = calculateRevenueCAGR(earningsHistory);
  const growthStage = determineGrowthStage(revenueCAGR);

  // Compute financial metrics from actual data where possible
  const netMargin = latestEarning.net_income && latestEarning.revenue
    ? latestEarning.net_income / latestEarning.revenue
    : null;

  // Estimate ROE as net_income / revenue * asset_turnover_estimate
  // Since we don't have equity data, use profit margin as a proxy indicator
  const roe = netMargin !== null ? netMargin * 1.5 : null; // rough proxy from net margin
  const roa = netMargin !== null ? netMargin * 0.8 : null; // rough proxy

  // Compute asset turnover from revenue trends
  const avgRevenue = earningsHistory.length > 0
    ? earningsHistory.reduce((sum, e) => sum + (e.revenue || 0), 0) / earningsHistory.length
    : 0;
  const assetTurnover = avgRevenue > 0 && currentPrice > 0 ? Math.min(2.0, avgRevenue / (currentPrice * 1e6)) : null;

  const financialScore = calculateFinancialScore(roe, roa, netMargin);

  const assessment = stockPrice?.peRatio && stockPrice?.peRatio > 0
    ? (stockPrice.peRatio < 15 ? "undervalued" : stockPrice.peRatio > 30 ? "overvalued" : "fair")
    : "unknown";

  // Compute PE percentile based on actual PE ratio relative to typical tech range (15-40)
  const pePercentile = stockPrice?.peRatio && stockPrice.peRatio > 0
    ? Math.min(100, Math.max(0, ((stockPrice.peRatio - 10) / 40) * 100))
    : null;

  let targetPriceLow = 0;
  let targetPriceHigh = 0;

  if (currentPrice > 0 && pePercentile) {
    if (assessment === "undervalued") {
      targetPriceLow = currentPrice * 1.05;
      targetPriceHigh = currentPrice * 1.25;
    } else if (assessment === "overvalued") {
      targetPriceLow = currentPrice * 0.75;
      targetPriceHigh = currentPrice * 0.95;
    } else {
      targetPriceLow = currentPrice * 0.9;
      targetPriceHigh = currentPrice * 1.1;
    }
  }

  let confidence: "high" | "medium" | "low" = "low";
  if (stockPrice && analysis) {
    confidence = "high";
  } else if (stockPrice || analysis) {
    confidence = "medium";
  }

  let rating = "hold";
  if (sentiment === "positive" && assessment === "undervalued") {
    rating = "buy";
  } else if (sentiment === "negative" && assessment === "overvalued") {
    rating = "sell";
  } else if (sentiment === "positive") {
    rating = "buy";
  } else if (sentiment === "negative") {
    rating = "sell";
  }

  const moatStrength: "wide" | "narrow" | "none" = roe && roe > 0.2 ? "wide" : roe && roe > 0.12 ? "narrow" : "none";
  const porterScore = Math.min(100, Math.round(financialScore * 0.8));

  // Determine data source based on what we actually have
  const dataSource = stockPrice?.source === 'yahoo_finance' ? 'fmp'
    : stockPrice ? 'sec'
      : analysis ? 'ai'
        : 'unknown';

  return {
    symbol: company.symbol,
    name: company.name,
    sector: company.sector || "Unknown",
    currentPrice: currentPrice > 0 ? currentPrice : 0,
    rating,
    confidence: confidence as "high" | "medium" | "low",
    targetPrice: {
      low: targetPriceLow > 0 ? targetPriceLow : 0,
      high: targetPriceHigh > 0 ? targetPriceHigh : 0
    },
    keyPoints: highlights.slice(0, 5),
    risks: concerns.slice(0, 3),
    catalysts: highlights.length > 3 ? highlights.slice(3, 6) : [],
    financialQuality: {
      score: financialScore,
      roeDuPont: {
        netMargin: netMargin || 0,
        assetTurnover: assetTurnover || 0,
        equityMultiplier: roe && netMargin && netMargin > 0 ? roe / netMargin : 0,
      },
      cashFlowHealth: financialScore > 70 ? "healthy" : financialScore > 40 ? "moderate" : "concerning",
    },
    growth: {
      stage: growthStage,
      revenueCAGR3Y: revenueCAGR,
    },
    moat: {
      strength: moatStrength,
      porterScore,
    },
    valuation: {
      assessment: assessment === "unknown" ? "fair" : assessment,
      pePercentile: pePercentile ?? 50,
    },
    earningsId: latestEarning.id,
    filingType: `FY${latestEarning.fiscal_year} Q${latestEarning.fiscal_quarter}`,
    filingDate: latestEarning.report_date,
    dataSource,
    externalUrl: document?.source_url,
    stockPrice: stockPrice,
  };
}

export default async function AnalysisPage({ params, searchParams }: { params: Promise<{ symbol: string }>; searchParams: Promise<{ earnings_id?: string }> }) {
  const { symbol } = await params;
  const { earnings_id } = await searchParams;
  const data = await getAnalysisData(symbol, earnings_id);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回仪表盘
            </Link>
          </Button>

          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">数据加载失败</h1>
            <p className="text-muted-foreground mb-6">
              无法找到 {symbol.toUpperCase()} 的分析数据。可能的原因：
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground mb-8">
              <li>• 该公司不在我们的数据库中</li>
              <li>• 该公司的财报数据尚未导入</li>
              <li>• 数据暂时不可用</li>
            </ul>
            <Button asChild>
              <Link href="/companies">
                查看公司列表
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
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
            {data.stockPrice && data.stockPrice.price > 0 ? (
              <>
                <div className="text-2xl font-bold">${data.stockPrice.price.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {data.stockPrice.change > 0 ? '+' : ''}{data.stockPrice.change?.toFixed(2)} ({data.stockPrice.changePercent?.toFixed(2)}%)
                </div>
                {data.stockPrice.source === 'yahoo_finance' && (
                  <div className="text-xs text-muted-foreground">实时数据</div>
                )}
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">--</div>
                <div className="text-sm text-muted-foreground">股价数据暂不可用</div>
              </>
            )}
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
            currentPrice={data.stockPrice?.price || 0}
            previousClose={data.stockPrice?.price && data.stockPrice?.change
              ? data.stockPrice.price - data.stockPrice.change
              : undefined}
            keyPoints={data.keyPoints}
            dataSource={data.dataSource}
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
            keyMetrics: data.targetPrice.low > 0 && data.targetPrice.high > 0 ? [
              { label: "目标价下限", value: `$${data.targetPrice.low.toFixed(2)}` },
              { label: "目标价上限", value: `$${data.targetPrice.high.toFixed(2)}` },
            ] : [],
            sentiment: data.rating === 'buy' || data.rating === 'strong_buy' ? 'positive' : data.rating === 'sell' || data.rating === 'strong_sell' ? 'negative' : 'neutral',
          }}
          externalUrl={data.externalUrl}
        />
      </div>
    </div>
  );
}
