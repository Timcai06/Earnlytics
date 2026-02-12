"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { HeartPulse, TrendingUp, DollarSign, Activity } from "lucide-react";

interface FinancialHealthScorecardProps {
  score: number;
  roeDuPont: {
    netMargin: number;
    assetTurnover: number;
    equityMultiplier: number;
  };
  cashFlowHealth: "healthy" | "moderate" | "concerning";
  className?: string;
}

export function FinancialHealthScorecard({
  score,
  roeDuPont,
  cashFlowHealth,
  className,
}: FinancialHealthScorecardProps) {
  const getHealthConfig = (health: string) => {
    switch (health) {
      case "healthy":
        return {
          label: "健康",
          labelEn: "Healthy",
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          progressColor: "bg-emerald-500",
        };
      case "moderate":
        return {
          label: "中等",
          labelEn: "Moderate",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          progressColor: "bg-amber-500",
        };
      case "concerning":
        return {
          label: "需关注",
          labelEn: "Concerning",
          color: "text-red-600",
          bgColor: "bg-red-50",
          progressColor: "bg-red-500",
        };
      default:
        return {
          label: "未知",
          labelEn: "Unknown",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          progressColor: "bg-gray-500",
        };
    }
  };

  const cashFlowConfig = getHealthConfig(cashFlowHealth);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-primary" />
          财务健康度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">综合评分</span>
            <span className="text-2xl font-bold">{score}/100</span>
          </div>
          <div className="relative">
            <Progress value={score} className="h-3" />
            <div
              className="absolute top-0 w-0.5 h-3 bg-black/20"
              style={{ left: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>杜邦分析 - ROE拆解</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">净利率</span>
              </div>
              <span className="text-lg font-semibold">{(roeDuPont.netMargin * 100).toFixed(1)}%</span>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">资产周转率</span>
              </div>
              <span className="text-lg font-semibold">{roeDuPont.assetTurnover.toFixed(2)}x</span>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">权益乘数</span>
              </div>
              <span className="text-lg font-semibold">{roeDuPont.equityMultiplier.toFixed(2)}x</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <span className="font-medium">杜邦公式:</span> ROE = 净利率 × 资产周转率 × 权益乘数
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">现金流状况</span>
            <span
              className={cn(
                "px-2 py-1 rounded text-sm font-medium",
                cashFlowConfig.bgColor,
                cashFlowConfig.color
              )}
            >
              {cashFlowConfig.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            基于经营性现金流与净利润的比率、自由现金流持续性等指标评估
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
