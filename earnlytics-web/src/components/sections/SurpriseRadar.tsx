"use client";

import { useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Target, TrendingUp } from "lucide-react";

type SurpriseStatus = 'beat' | 'miss' | 'meet';

interface MetricData {
  metric: string;
  actual: number | null;
  expected: number | null;
  surprise_pct: number | null;
  status: SurpriseStatus;
  displayValue: string;
  displayExpected: string;
}

interface SurpriseRadarProps {
  data: {
    eps: {
      actual: number | null;
      expected: number | null;
      surprise_pct: number | null;
    };
    revenue: {
      actual: number | null;
      expected: number | null;
      surprise_pct: number | null;
    };
    gross_margin?: {
      actual: number | null;
      expected: number | null;
      surprise_pct: number | null;
    };
    net_income?: {
      actual: number | null;
      expected: number | null;
      surprise_pct: number | null;
    };
    free_cash_flow?: {
      actual: number | null;
      expected: number | null;
      surprise_pct: number | null;
    };
  };
  className?: string;
  isLoading?: boolean;
}

const metricConfig = {
  eps: { label: "EPS", unit: "$", format: (v: number) => `$${v.toFixed(2)}` },
  revenue: { label: "营收", unit: "$", format: (v: number) => formatCurrency(v) },
  gross_margin: { label: "毛利率", unit: "%", format: (v: number) => `${v.toFixed(1)}%` },
  net_income: { label: "净利润", unit: "$", format: (v: number) => formatCurrency(v) },
  free_cash_flow: { label: "现金流", unit: "$", format: (v: number) => formatCurrency(v) },
};

const statusConfig = {
  beat: {
    color: "#22C55E",
    fillColor: "rgba(34, 197, 94, 0.3)",
    textColor: "text-success",
    bgColor: "bg-success/20",
    label: "超预期",
    icon: "↑",
  },
  miss: {
    color: "#EF4444",
    fillColor: "rgba(239, 68, 68, 0.3)",
    textColor: "text-error",
    bgColor: "bg-error/20",
    label: "低于预期",
    icon: "↓",
  },
  meet: {
    color: "#F59E0B",
    fillColor: "rgba(245, 158, 11, 0.3)",
    textColor: "text-warning",
    bgColor: "bg-warning/20",
    label: "符合预期",
    icon: "≈",
  },
};

function getStatus(surprise_pct: number | null): SurpriseStatus {
  if (surprise_pct === null) return 'meet';
  if (surprise_pct > 5) return 'beat';
  if (surprise_pct < -5) return 'miss';
  return 'meet';
}

function normalizeValue(value: number | null, expected: number | null, metricKey: string): number {
  if (value === null) return 0;
  if (expected === null || expected === 0) return 50;
  
  const ratio = value / expected;
  const normalized = ratio * 100;
  
  return Math.min(Math.max(normalized, 0), 150);
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MetricData }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const config = metricConfig[data.metric as keyof typeof metricConfig];
    const statusCfg = statusConfig[data.status];
    
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-lg min-w-[180px]">
        <p className="text-white font-semibold mb-2">{config?.label ?? data.metric}</p>
        
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">实际值</span>
            <span className="text-white font-medium">{data.displayValue}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">预期值</span>
            <span className="text-text-tertiary">{data.displayExpected}</span>
          </div>
          
          {data.surprise_pct !== null && (
            <div className="flex justify-between">
              <span className="text-text-secondary">差异</span>
              <span className={cn("font-medium", statusCfg.textColor)}>
                {data.surprise_pct > 0 ? '+' : ''}{data.surprise_pct.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={cn("mt-2 pt-2 border-t border-border flex items-center gap-1.5", statusCfg.textColor)}>
          <span>{statusCfg.icon}</span>
          <span className="text-xs">{statusCfg.label}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function SurpriseRadar({
  data,
  className,
  isLoading = false,
}: SurpriseRadarProps) {
  const radarData = useMemo(() => {
    const metrics: MetricData[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (!value) return;
      
      const config = metricConfig[key as keyof typeof metricConfig];
      if (!config) return;
      
      const status = getStatus(value.surprise_pct);
      const actualNormalized = normalizeValue(value.actual, value.expected, key);
      const expectedNormalized = 100;
      
      metrics.push({
        metric: key,
        actual: actualNormalized,
        expected: expectedNormalized,
        surprise_pct: value.surprise_pct,
        status,
        displayValue: value.actual !== null ? config.format(value.actual) : 'N/A',
        displayExpected: value.expected !== null ? config.format(value.expected) : 'N/A',
      });
    });
    
    return metrics;
  }, [data]);

  const summary = useMemo(() => {
    const total = radarData.length;
    if (total === 0) return null;
    
    const beat = radarData.filter(m => m.status === 'beat').length;
    const miss = radarData.filter(m => m.status === 'miss').length;
    const meet = radarData.filter(m => m.status === 'meet').length;
    
    return { total, beat, miss, meet };
  }, [radarData]);

  if (isLoading) {
    return <ChartSkeleton className={className} />;
  }

  if (radarData.length === 0) {
    return (
      <Card className={cn("bg-surface border-border", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-text-secondary">暂无超预期数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-surface border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">超预期雷达</h3>
              <p className="text-xs text-text-tertiary">
                实际值 vs 预期值对比
              </p>
            </div>
          </div>
          
          {summary && (
            <div className="flex items-center gap-2">
              {summary.beat > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-success/20 text-success">
                  {summary.beat} 超预期
                </span>
              )}
              {summary.miss > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-error/20 text-error">
                  {summary.miss} 低于预期
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              data={radarData}
              margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
            >
              <PolarGrid 
                stroke="#3F3F46"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis 
                dataKey="metric"
                tick={({ payload, x, y, cx, cy, ...rest }) => {
                  const config = metricConfig[payload.value as keyof typeof metricConfig];
                  return (
                    <text
                      x={x}
                      y={y}
                      cx={cx}
                      cy={cy}
                      fill="#A1A1AA"
                      fontSize={12}
                      textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
                      dominantBaseline="central"
                    >
                      {config?.label ?? payload.value}
                    </text>
                  );
                }}
              />
              <PolarRadiusAxis 
                angle={90}
                domain={[0, 150]}
                tick={false}
                axisLine={{ stroke: "#3F3F46" }}
              />
              
              <Radar
                name="预期值"
                dataKey="expected"
                stroke="#A1A1AA"
                strokeDasharray="4 4"
                fill="transparent"
                fillOpacity={0}
              />
              
              <Radar
                name="实际值"
                dataKey="actual"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.3}
                dot={({ cx, cy, payload }) => {
                  const status = (payload as MetricData).status;
                  const statusCfg = statusConfig[status];
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={statusCfg.color}
                      stroke={statusCfg.color}
                      strokeWidth={2}
                    />
                  );
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-text-secondary text-sm">{value}</span>
                )}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {radarData.map((item) => {
            const config = metricConfig[item.metric as keyof typeof metricConfig];
            const statusCfg = statusConfig[item.status];
            
            return (
              <div 
                key={item.metric}
                className={cn(
                  "p-2 rounded-lg border text-center",
                  statusCfg.bgColor,
                  item.status === 'beat' && "border-success/30",
                  item.status === 'miss' && "border-error/30",
                  item.status === 'meet' && "border-warning/30"
                )}
              >
                <p className="text-xs text-text-secondary">{config?.label}</p>
                <p className={cn("text-sm font-semibold mt-0.5", statusCfg.textColor)}>
                  {statusCfg.icon} {item.surprise_pct !== null ? `${item.surprise_pct > 0 ? '+' : ''}${item.surprise_pct.toFixed(0)}%` : '--'}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default SurpriseRadar;
