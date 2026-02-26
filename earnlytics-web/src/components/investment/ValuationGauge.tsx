"use client";

import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";

interface ValuationGaugeProps {
  peRatio: number;
  historicalRange: {
    min: number;
    max: number;
  };
  industryAverage: number;
  percentile: number;
  className?: string;
}

function ValuationGaugeComponent({
  peRatio,
  historicalRange,
  industryAverage,
  percentile,
  className,
}: ValuationGaugeProps) {
  const assessment = useMemo(() => {
    if (percentile <= 25) return { label: "低估", labelEn: "Undervalued", color: "#10b981" };
    if (percentile <= 75) return { label: "合理", labelEn: "Fair", color: "#f59e0b" };
    return { label: "高估", labelEn: "Overvalued", color: "#ef4444" };
  }, [percentile]);

  const gaugeData = useMemo(() => [
    { name: "filled", value: percentile, color: assessment.color },
    { name: "empty", value: 100 - percentile, color: "#e5e7eb" },
  ], [percentile, assessment.color]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          估值分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-4">
          <div className="relative w-48 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="text-3xl font-bold">{peRatio.toFixed(1)}x</span>
              <span className="text-xs text-muted-foreground">P/E</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${assessment.color}20`, color: assessment.color }}
          >
            {assessment.label}
          </span>
          <span className="text-xs text-muted-foreground">({assessment.labelEn})</span>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">历史分位数</span>
            <span className="font-medium">{percentile.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">历史区间</span>
            <span className="font-medium">
              {historicalRange.min.toFixed(1)}x - {historicalRange.max.toFixed(1)}x
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">行业平均</span>
            <span className="font-medium">{industryAverage.toFixed(1)}x</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          <p>基于市盈率(P/E)历史分位数评估估值水平：</p>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            <li>0-25%: 历史低位，可能被低估</li>
            <li>25-75%: 历史均值区间，估值合理</li>
            <li>75-100%: 历史高位，可能被高估</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export const ValuationGauge = memo(ValuationGaugeComponent);
