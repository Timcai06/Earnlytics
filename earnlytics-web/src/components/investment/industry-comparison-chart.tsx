"use client";

import { memo, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface PeerData {
  symbol: string;
  value: number;
  isTarget: boolean;
}

interface IndustryComparisonChartProps {
  data: PeerData[];
  metric: string;
  metricUnit: string;
  industryAverage: number;
  targetSymbol: string;
  className?: string;
}

function IndustryComparisonChartComponent({
  data,
  metric,
  metricUnit,
  industryAverage,
  targetSymbol,
  className,
}: IndustryComparisonChartProps) {
  const CustomTooltip = useCallback(({ active, payload }: { active?: boolean; payload?: Array<{payload: PeerData}> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">
            {item.symbol}
            {item.isTarget && <span className="text-primary ml-1">(当前)</span>}
          </p>
          <p className="text-sm">
            {metric}: <span className="font-semibold">{item.value.toFixed(2)}{metricUnit}</span>
          </p>
        </div>
      );
    }
    return null;
  }, [metric, metricUnit]);

  const sortedData = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  
  const targetValue = useMemo(() => data.find(d => d.isTarget)?.value || 0, [data]);
  const percentile = useMemo(() => ((targetValue - industryAverage) / industryAverage) * 100, [targetValue, industryAverage]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          行业对比 - {metric}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <span className="text-xs text-muted-foreground block mb-1">{targetSymbol}</span>
            <span className="text-xl font-bold text-primary">
              {data.find(d => d.isTarget)?.value.toFixed(2)}{metricUnit}
            </span>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <span className="text-xs text-muted-foreground block mb-1">行业平均</span>
            <span className="text-xl font-bold">
              {industryAverage.toFixed(2)}{metricUnit}
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sortedData} 
              layout="vertical" 
              margin={{ left: 50, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}${metricUnit}`}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="symbol" 
                width={45}
                stroke="#6b7280"
                fontSize={11}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                x={industryAverage} 
                stroke="#f59e0b" 
                strokeDasharray="3 3"
                label={{ value: "行业平均", position: "top", fill: "#f59e0b", fontSize: 10 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isTarget ? "#3b82f6" : "#94a3b8"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span>当前公司</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
            <span>同业公司</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-amber-500 border-dashed" style={{ borderTop: '2px dashed #f59e0b' }} />
            <span>行业平均</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <span className="font-medium">{targetSymbol}</span> 的{metric}较行业平均
          <span className={percentile >= 0 ? "text-emerald-600" : "text-red-600"}>
            {percentile >= 0 ? "高" : "低"} {Math.abs(percentile).toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const IndustryComparisonChart = memo(IndustryComparisonChartComponent);
