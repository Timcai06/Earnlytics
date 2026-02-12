"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertCircle, Target } from "lucide-react";
import type { Company } from "@/types/database";
import CompaniesList from "../companies/CompaniesList";
import CalendarClient from "../calendar/CalendarClient";

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
  const configs: Record<string, { label: string; color: string; bgColor: string; icon: typeof TrendingUp }> = {
    strong_buy: { label: "强烈买入", color: "text-emerald-700", bgColor: "bg-emerald-50", icon: TrendingUp },
    buy: { label: "买入", color: "text-green-700", bgColor: "bg-green-50", icon: TrendingUp },
    hold: { label: "持有", color: "text-amber-700", bgColor: "bg-amber-50", icon: AlertCircle },
    sell: { label: "卖出", color: "text-orange-700", bgColor: "bg-orange-50", icon: TrendingDown },
    strong_sell: { label: "强烈卖出", color: "text-red-700", bgColor: "bg-red-50", icon: TrendingDown },
  };
  return configs[rating] || configs.hold;
}

function OverviewTab({ recommendations }: { recommendations: InvestmentRecommendation[] }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日分析覆盖
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">30</div>
            <p className="text-xs text-muted-foreground">家科技公司</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              买入评级
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {recommendations.filter(r => r.rating === 'buy' || r.rating === 'strong_buy').length}
            </div>
            <p className="text-xs text-muted-foreground">家公司</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最新更新
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {recommendations.length > 0 
                ? new Date(recommendations[0].updatedAt).toLocaleDateString('zh-CN')
                : '-'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {recommendations.length > 0 
                ? new Date(recommendations[0].updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : ''
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">最新投资建议</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const config = getRatingConfig(rec.rating);
            const RatingIcon = config.icon;
            const upside = rec.currentPrice > 0 
              ? ((rec.targetPriceHigh - rec.currentPrice) / rec.currentPrice * 100)
              : 0;

            return (
              <Card key={rec.symbol} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">{rec.symbol}</span>
                        <span className="text-sm text-muted-foreground">{rec.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={config.bgColor + " " + config.color}>
                          <RatingIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline">
                          {rec.confidence === 'high' ? '高置信度' : rec.confidence === 'medium' ? '中等置信度' : '低置信度'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">${rec.currentPrice.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">当前价格</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">目标价区间</div>
                      <div className="font-semibold">
                        ${rec.targetPriceLow.toFixed(2)} - ${rec.targetPriceHigh.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${upside >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">预期涨幅</div>
                    </div>
                  </div>

                  {rec.keyPoints.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {rec.keyPoints.slice(0, 2).map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground line-clamp-2">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/analysis/${rec.symbol}`}>
                        深度分析
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/earnings/${rec.symbol}`}>
                        财报详情
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {recommendations.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">暂无投资建议</h3>
          <p className="text-muted-foreground mb-4">
            请先运行分析脚本生成投资建议数据
          </p>
          <Button asChild>
            <Link href="/companies">浏览公司列表</Link>
          </Button>
        </Card>
      )}
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
      <TabsList className="mb-6">
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="companies">公司</TabsTrigger>
        <TabsTrigger value="calendar">日历</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab recommendations={initialRecommendations} />
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
