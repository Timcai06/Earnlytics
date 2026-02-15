"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertCircle, Target, Sparkles, Building2, Calendar } from "lucide-react";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { NoDataState } from "@/components/ui/empty-state";
import type { Company } from "@/types/database";
import CompaniesList from "../companies/CompaniesList";
import CalendarClient from "../calendar/CalendarClient";
import { useState, useEffect } from "react";

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

interface DashboardClientProps {
  initialRecommendations: InvestmentRecommendation[];
  companies: Company[];
}

function getRatingConfig(rating: string) {
  const configs: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    strong_buy: {
      label: "强烈买入",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30"
    },
    buy: {
      label: "买入",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    },
    hold: {
      label: "持有",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30"
    },
    sell: {
      label: "卖出",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30"
    },
    strong_sell: {
      label: "强烈卖出",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30"
    },
  };
  return configs[rating] || configs.hold;
}

function getConfidenceLabel(confidence: string): string {
  const labels: Record<string, string> = {
    high: "高置信度",
    medium: "中等置信度",
    low: "低置信度",
  };
  return labels[confidence] || "中等置信度";
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon
}: {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
  icon: typeof Building2;
}) {
  return (
    <Card className="bg-surface border-border hover:border-border transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-text-secondary">
            {title}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {trend && (
            <span className={`text-sm ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-amber-400"}`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ recommendations, companiesCount }: { recommendations: InvestmentRecommendation[]; companiesCount: number }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const buyCount = recommendations.filter(r => r.rating === 'buy' || r.rating === 'strong_buy').length;
  const sellCount = recommendations.filter(r => r.rating === 'sell' || r.rating === 'strong_sell').length;
  const holdCount = recommendations.filter(r => r.rating === 'hold').length;

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </>
    );
  }

  if (recommendations.length === 0) {
    return (
      <NoDataState
        title="暂无投资建议"
        description="请先运行分析脚本生成投资建议数据"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="分析覆盖"
          value={companiesCount}
          subtitle="家科技公司"
          icon={Building2}
          trend="up"
        />
        <StatCard
          title="买入评级"
          value={buyCount}
          subtitle="家公司"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="卖出评级"
          value={sellCount}
          subtitle="家公司"
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="持有评级"
          value={holdCount}
          subtitle="家公司"
          icon={AlertCircle}
          trend="neutral"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">最新投资建议</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {recommendations.slice(0, 6).map((rec) => {
            const config = getRatingConfig(rec.rating);
            const upside = rec.currentPrice > 0
              ? ((rec.targetPriceHigh - rec.currentPrice) / rec.currentPrice * 100)
              : 0;

            return (
              <Card key={rec.symbol} className="bg-surface border-border hover:border-border transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-white">{rec.symbol}</span>
                        <span className="text-sm text-text-tertiary">{rec.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${config.bgColor} ${config.color} border-0`}>
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-text-tertiary border-border">
                          {getConfidenceLabel(rec.confidence)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {rec.currentPrice > 0 ? (
                        <>
                          <div className="text-lg font-semibold text-white">${rec.currentPrice.toFixed(2)}</div>
                          <div className="text-xs text-text-tertiary">当前价格</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-semibold text-text-tertiary">--</div>
                          <div className="text-xs text-text-tertiary">价格暂不可用</div>
                        </>
                      )}
                    </div>
                  </div>

                  {rec.targetPriceHigh > 0 && rec.targetPriceLow > 0 ? (
                    <div className="flex items-center gap-4 mb-4 p-3 bg-surface-secondary rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-text-tertiary">目标价区间</div>
                        <div className="font-semibold text-white">
                          ${rec.targetPriceLow.toFixed(2)} - ${rec.targetPriceHigh.toFixed(2)}
                        </div>
                      </div>
                      {rec.currentPrice > 0 && (
                        <div className="text-right">
                          <div className={`text-sm font-medium ${upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                          </div>
                          <div className="text-xs text-text-tertiary">预期涨幅</div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {rec.keyPoints.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {rec.keyPoints.slice(0, 2).map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-text-secondary line-clamp-2">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-primary hover:bg-primary-hover">
                      <Link href={`/analysis/${rec.symbol.toLowerCase()}`}>
                        深度分析
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="border-border text-text-secondary hover:text-white hover:bg-surface-secondary">
                      <Link href={`/earnings/${rec.symbol.toLowerCase()}`}>
                        财报
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

function CompaniesTab({ companies }: { companies: Company[] }) {
  return <CompaniesList companies={companies} />;
}

function CalendarTab() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return <CalendarClient initialYear={year} initialMonth={month} />;
}

export default function DashboardClient({ initialRecommendations, companies }: DashboardClientProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-6 bg-surface-secondary border border-border">
        <TabsTrigger value="overview" className="data-[state=active]:bg-surface-secondary data-[state=active]:text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          概览
        </TabsTrigger>
        <TabsTrigger value="companies" className="data-[state=active]:bg-surface-secondary data-[state=active]:text-white">
          <Building2 className="h-4 w-4 mr-2" />
          公司
        </TabsTrigger>
        <TabsTrigger value="calendar" className="data-[state=active]:bg-surface-secondary data-[state=active]:text-white">
          <Calendar className="h-4 w-4 mr-2" />
          日历
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab recommendations={initialRecommendations} companiesCount={companies.length} />
      </TabsContent>

      <TabsContent value="companies">
        <CompaniesTab companies={companies} />
      </TabsContent>

      <TabsContent value="calendar">
        <CalendarTab />
      </TabsContent>
    </Tabs>
  );
}
