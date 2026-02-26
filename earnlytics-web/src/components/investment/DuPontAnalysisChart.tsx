"use client";

import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface DuPontData {
  factor: string;
  factorEn: string;
  value: number;
  contribution: number;
  color: string;
}

interface DuPontAnalysisChartProps {
  data: DuPontData[];
  roe: number;
  className?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DuPontData }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{item.factor}</p>
        <p className="text-sm text-muted-foreground">{item.factorEn}</p>
        <p className="text-sm mt-1">
          数值: <span className="font-semibold">{item.value.toFixed(2)}</span>
        </p>
        <p className="text-sm">
          贡献度: <span className="font-semibold">{(item.contribution * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
}

function DuPontAnalysisChartComponent({
  data,
  roe,
  className,
}: DuPontAnalysisChartProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          杜邦分析 - ROE拆解
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">ROE (净资产收益率)</span>
          <span className="text-2xl font-bold text-primary">{(roe * 100).toFixed(1)}%</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                domain={[0, 'auto']} 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="factor" 
                width={80}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {data.map((item, index) => (
            <div key={index} className="p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">{item.factor}</div>
              <div className="font-semibold" style={{ color: item.color }}>
                {item.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <span className="font-medium">ROE = 净利率 × 资产周转率 × 权益乘数</span>
          <br />
          杜邦分析将ROE拆解为三个驱动因素，帮助理解公司盈利能力的来源
        </div>
      </CardContent>
    </Card>
  );
}

export const DuPontAnalysisChart = memo(DuPontAnalysisChartComponent);
