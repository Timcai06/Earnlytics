"use client";

import { memo, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Rocket, Building2, AlertTriangle } from "lucide-react";

interface GrowthStageData {
  year: string;
  revenue: number;
  growthRate: number;
}

interface GrowthStageChartProps {
  data: GrowthStageData[];
  currentStage: "introduction" | "growth" | "maturity" | "decline";
  revenueCAGR3Y: number;
  className?: string;
}

const stageConfigMap = {
  introduction: {
    label: "导入期",
    labelEn: "Introduction",
    description: "市场验证阶段，高增长高风险",
    icon: Rocket,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  growth: {
    label: "成长期",
    labelEn: "Growth",
    description: "快速扩张阶段，规模效应显现",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  maturity: {
    label: "成熟期",
    labelEn: "Maturity",
    description: "稳定盈利阶段，关注效率提升",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  decline: {
    label: "衰退期",
    labelEn: "Decline",
    description: "增长放缓，需转型或创新",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
};

function GrowthStageChartComponent({
  data,
  currentStage,
  revenueCAGR3Y,
  className,
}: GrowthStageChartProps) {
  const stageConfig = useMemo(() => stageConfigMap[currentStage] || stageConfigMap.maturity, [currentStage]);

  const StageIcon = stageConfig.icon;

  const CustomTooltip = useCallback(({ active, payload }: { active?: boolean; payload?: Array<{payload?: GrowthStageData}> }) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      if (!item) return null;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.year}</p>
          <p className="text-sm">
            营收: <span className="font-semibold">${(item.revenue / 1e9).toFixed(1)}B</span>
          </p>
          <p className="text-sm">
            增长率: <span className="font-semibold">{(item.growthRate * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          成长阶段分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn("p-4 rounded-lg", stageConfig.bgColor)}>
          <div className="flex items-center gap-2 mb-2">
            <StageIcon className={cn("h-5 w-5", stageConfig.color)} />
            <span className={cn("font-semibold", stageConfig.color)}>
              {stageConfig.label}
            </span>
            <Badge variant="outline" className="text-xs">
              {stageConfig.labelEn}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{stageConfig.description}</p>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">3年营收复合增长率 (CAGR)</span>
          <span className="text-xl font-bold text-primary">
            {(revenueCAGR3Y * 100).toFixed(1)}%
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1e9).toFixed(0)}B`}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tickLine={false}
              />
              <Tooltip content={CustomTooltip} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="growthRate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500" />
            <span>营收</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-emerald-500 border-dashed" style={{ borderTop: '2px dashed #10b981' }} />
            <span>增长率</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const GrowthStageChart = memo(GrowthStageChartComponent);
