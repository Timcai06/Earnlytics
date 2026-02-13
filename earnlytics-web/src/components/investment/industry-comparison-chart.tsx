"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  BarChart3,
  Radar as RadarIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type ChartView = "bar" | "radar";
type MetricType = "pe" | "pb" | "roe" | "revenue_growth" | "profit_margin";

interface PeerData {
  symbol: string;
  name: string;
  values: Record<MetricType, number>;
  isTarget: boolean;
}

interface IndustryComparisonChartProps {
  peers: PeerData[];
  targetSymbol: string;
  sectorName: string;
  className?: string;
}

const metricConfig: Record<
  MetricType,
  { label: string; unit: string; description: string }
> = {
  pe: { label: "市盈率", unit: "x", description: "股价/每股收益" },
  pb: { label: "市净率", unit: "x", description: "股价/每股净资产" },
  roe: { label: "ROE", unit: "%", description: "净资产收益率" },
  revenue_growth: { label: "营收增长", unit: "%", description: "同比增长率" },
  profit_margin: { label: "净利润率", unit: "%", description: "净利润/营收" },
};

function BarComparisonView({
  data,
  metric,
  industryAverage,
}: {
  data: Array<{ symbol: string; value: number; isTarget: boolean }>;
  metric: MetricType;
  industryAverage: number;
}) {
  const config = metricConfig[metric];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 60, right: 30, top: 10, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="#27272A"
        />
        <XAxis
          type="number"
          domain={[0, "auto"]}
          tickFormatter={(value) => `${value}${config.unit}`}
          stroke="#71717A"
          fontSize={11}
        />
        <YAxis
          type="category"
          dataKey="symbol"
          width={55}
          stroke="#71717A"
          fontSize={11}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload;
              return (
                <div className="bg-[#18181B] border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-medium text-white">
                    {item.symbol}
                    {item.isTarget && (
                      <span className="text-primary ml-1">(当前)</span>
                    )}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {config.label}: {" "}
                    <span className="font-semibold text-white">
                      {item.value.toFixed(2)}
                      {config.unit}
                    </span>
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <ReferenceLine
          x={industryAverage}
          stroke="#F59E0B"
          strokeDasharray="3 3"
          label={{
            value: "行业平均",
            position: "top",
            fill: "#F59E0B",
            fontSize: 10,
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isTarget ? "#6366F1" : "#71717A"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RadarComparisonView({
  data,
  targetSymbol,
}: {
  data: Array<{ metric: string; target: number; average: number }>;
  targetSymbol: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#27272A" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#A1A1AA", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, "auto"]}
          tick={{ fill: "#71717A", fontSize: 10 }}
          stroke="#27272A"
        />
        <Radar
          name={targetSymbol}
          dataKey="target"
          stroke="#6366F1"
          fill="#6366F1"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name="行业平均"
          dataKey="average"
          stroke="#F59E0B"
          fill="#F59E0B"
          fillOpacity={0.1}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="circle"
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload) {
              return (
                <div className="bg-[#18181B] border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-medium text-white mb-1">{label}</p>
                  {payload.map((item, idx) => (
                    <p key={idx} className="text-sm" style={{ color: item.color }}>
                      {item.name}: {Number(item.value).toFixed(2)}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function IndustryComparisonChart({
  peers,
  targetSymbol,
  sectorName,
  className,
}: IndustryComparisonChartProps) {
  const [chartView, setChartView] = useState<ChartView>("bar");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("pe");

  const targetPeer = useMemo(
    () => peers.find((p) => p.isTarget),
    [peers]
  );

  const industryAverages = useMemo(() => {
    const metrics: MetricType[] = ["pe", "pb", "roe", "revenue_growth", "profit_margin"];
    const averages: Partial<Record<MetricType, number>> = {};

    metrics.forEach((metric) => {
      const values = peers.map((p) => p.values[metric]).filter((v) => v > 0);
      averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    return averages as Record<MetricType, number>;
  }, [peers]);

  const barData = useMemo(() => {
    const data = peers
      .map((p) => ({
        symbol: p.symbol,
        value: p.values[selectedMetric],
        isTarget: p.isTarget,
      }))
      .sort((a, b) => b.value - a.value);
    return data;
  }, [peers, selectedMetric]);

  const radarData = useMemo(() => {
    return (Object.keys(metricConfig) as MetricType[]).map((metric) => ({
      metric: metricConfig[metric].label,
      target: targetPeer?.values[metric] || 0,
      average: industryAverages[metric] || 0,
    }));
  }, [targetPeer, industryAverages]);

  const targetValue = targetPeer?.values[selectedMetric] || 0;
  const industryAverage = industryAverages[selectedMetric] || 1;
  const percentile =
    ((targetValue - industryAverage) / Math.abs(industryAverage)) * 100;

  const config = metricConfig[selectedMetric];

  return (
    <Card className={cn("overflow-hidden bg-surface border-border", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#6366F1]/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">行业对比</h3>
              <p className="text-xs text-text-tertiary">{sectorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-secondary rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartView("bar")}
                className={cn(
                  "h-8 w-8 p-0",
                  chartView === "bar"
                    ? "bg-surface-secondary text-white"
                    : "text-text-tertiary hover:text-white"
                )}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartView("radar")}
                className={cn(
                  "h-8 w-8 p-0",
                  chartView === "radar"
                    ? "bg-surface-secondary text-white"
                    : "text-text-tertiary hover:text-white"
                )}
              >
                <RadarIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {chartView === "bar" && (
          <div className="flex flex-wrap gap-2 mt-2">
            {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
              <Button
                key={metric}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMetric(metric)}
                className={cn(
                  "h-7 text-xs",
                  selectedMetric === metric
                    ? "bg-[#6366F1]/10 text-primary hover:bg-[#6366F1]/20"
                    : "text-text-tertiary hover:text-white hover:bg-surface-secondary"
                )}
              >
                {metricConfig[metric].label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-surface-secondary rounded-lg border border-border">
            <span className="text-xs text-text-tertiary block mb-1">
              {targetSymbol}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">
                {targetValue.toFixed(2)}
              </span>
              <span className="text-sm text-text-tertiary">{config.unit}</span>
            </div>
            <p className="text-xs text-primary mt-1">{config.label}</p>
          </div>
          <div className="p-3 bg-surface-secondary rounded-lg border border-border">
            <span className="text-xs text-text-tertiary block mb-1">行业平均</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-text-secondary">
                {industryAverage.toFixed(2)}
              </span>
              <span className="text-sm text-text-tertiary">{config.unit}</span>
            </div>
            <p className="text-xs text-text-tertiary mt-1">{config.label}</p>
          </div>
        </div>

        <div className="h-64">
          {chartView === "bar" ? (
            <BarComparisonView
              data={barData}
              metric={selectedMetric}
              industryAverage={industryAverage}
            />
          ) : (
            <RadarComparisonView data={radarData} targetSymbol={targetSymbol} />
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#6366F1] rounded-sm" />
            <span className="text-text-secondary">当前公司</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#71717A] rounded-sm" />
            <span className="text-text-secondary">同业公司</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0 border-t-2 border-dashed border-[#F59E0B]" />
            <span className="text-text-secondary">行业平均</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg border border-border">
          <span className="text-sm text-text-secondary">
            {targetSymbol} 的{config.label}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "border-0",
              percentile >= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {percentile >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            较行业平均 {percentile >= 0 ? "高" : "低"} {Math.abs(percentile).toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default IndustryComparisonChart;
