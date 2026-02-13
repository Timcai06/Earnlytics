"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
} from "lucide-react";

type ChartType = "bar" | "line" | "area" | "dual";
type TimeRange = "1Y" | "3Y" | "5Y" | "ALL";
type DataType = "revenue" | "eps" | "growth";

interface TrendData {
  quarter: string;
  date: string;
  revenue: number | null;
  eps: number | null;
  revenueGrowth: number | null;
  qoqGrowth?: number | null;
}

interface EarningsTrendChartProps {
  data: TrendData[];
  defaultType?: DataType;
  title?: string;
  className?: string;
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function filterDataByTimeRange(data: TrendData[], range: TimeRange): TrendData[] {
  if (range === "ALL") return data;

  const now = new Date();
  const years = range === "1Y" ? 1 : range === "3Y" ? 3 : 5;
  const cutoffDate = new Date(now.getFullYear() - years, now.getMonth(), 1);

  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

function calculateQoQGrowth(data: TrendData[]): TrendData[] {
  return data.map((item, index) => {
    if (index === 0) return { ...item, qoqGrowth: null };
    const prevRevenue = data[index - 1].revenue;
    const currRevenue = item.revenue;
    if (!prevRevenue || !currRevenue) return { ...item, qoqGrowth: null };
    const qoqGrowth = ((currRevenue - prevRevenue) / prevRevenue) * 100;
    return { ...item, qoqGrowth: Number(qoqGrowth.toFixed(1)) };
  });
}

function CustomTooltip({
  active,
  payload,
  label,
  dataType,
  isDual,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color?: string; payload: TrendData }>;
  label?: string;
  dataType: DataType;
  isDual?: boolean;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    if (isDual) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg min-w-[180px]">
          <p className="text-text-secondary text-sm mb-2 font-medium">{label}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-text-secondary text-sm">营收</span>
              </div>
              <span className="text-white font-semibold">
                {formatCurrency(data.revenue)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-text-secondary text-sm">同比</span>
              </div>
              <span className={`font-semibold ${(data.revenueGrowth || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.revenueGrowth !== null && data.revenueGrowth !== undefined 
                  ? `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
            
            {data.qoqGrowth !== null && data.qoqGrowth !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-text-secondary" />
                  <span className="text-text-tertiary text-xs">环比</span>
                </div>
                <span className={`text-xs font-medium ${data.qoqGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.qoqGrowth > 0 ? '+' : ''}{data.qoqGrowth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    const value = payload[0].value;

    const configs = {
      revenue: {
        label: "营收",
        format: formatCurrency(value),
        color: "#6366F1",
      },
      eps: {
        label: "每股收益",
        format: `$${value?.toFixed(2) || "N/A"}`,
        color: "#22C55E",
      },
      growth: {
        label: "同比增长",
        format: value !== null ? `${value > 0 ? "+" : ""}${value?.toFixed(1)}%` : "N/A",
        color: value >= 0 ? "#22C55E" : "#EF4444",
      },
    };

    const config = configs[dataType];

    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
        <p className="text-text-secondary text-sm mb-1">{label}</p>
        <p className="text-white font-semibold" style={{ color: config.color }}>
          {config.format}
        </p>
        <p className="text-text-tertiary text-xs mt-1">{config.label}</p>
        {dataType === "revenue" && data.qoqGrowth !== null && data.qoqGrowth !== undefined && (
          <p className={`text-xs mt-1 ${data.qoqGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            环比 {data.qoqGrowth > 0 ? '+' : ''}{data.qoqGrowth.toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function EarningsTrendChart({
  data,
  defaultType = "revenue",
  title = "财报趋势",
  className,
}: EarningsTrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dataType, setDataType] = useState<DataType>(defaultType);
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");

  const processedData = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const filtered = filterDataByTimeRange(sorted, timeRange);
    return calculateQoQGrowth(filtered);
  }, [data, timeRange]);

  const exportData = () => {
    const csvContent = [
      ["季度", "日期", "营收", "EPS", "同比增长", "环比增长"].join(","),
      ...processedData.map((item) =>
        [item.quarter, item.date, item.revenue, item.eps, item.revenueGrowth, item.qoqGrowth].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `earnings-trend-${dataType}-${timeRange}.csv`;
    link.click();
  };

  const dataTypeConfig = {
    revenue: {
      label: "营收",
      icon: DollarSign,
      color: "#6366F1",
      gradient: ["#6366F1", "#818CF8"],
    },
    eps: {
      label: "每股收益",
      icon: TrendingUp,
      color: "#22C55E",
      gradient: ["#22C55E", "#4ADE80"],
    },
    growth: {
      label: "同比增长",
      icon: Percent,
      color: "#3B82F6",
      gradient: ["#3B82F6", "#60A5FA"],
    },
  };

  const config = dataTypeConfig[dataType];

  const getBarColor = (entry: TrendData) => {
    const growth = entry.revenueGrowth;
    if (growth === null || growth === undefined) return "#6366F1";
    return growth >= 0 ? "#22C55E" : "#EF4444";
  };

  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 10, right: 20, left: 10, bottom: 5 },
    };

    const commonAxisProps = {
      xAxis: {
        dataKey: "quarter",
        tick: { fill: "#A1A1AA", fontSize: 12 },
        axisLine: { stroke: "#3F3F46" },
        tickLine: { stroke: "#3F3F46" },
      },
      yAxis: {
        tick: { fill: "#A1A1AA", fontSize: 12 },
        axisLine: { stroke: "#3F3F46" },
        tickLine: { stroke: "#3F3F46" },
        tickFormatter: (value: number) => {
          if (dataType === "revenue") {
            if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
            if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
          }
          if (dataType === "eps") return `$${value.toFixed(1)}`;
          return `${value}%`;
        },
      },
      grid: {
        strokeDasharray: "3 3",
        stroke: "#27272A",
      },
    };

    const dataKey = dataType;

    if (chartType === "dual") {
      return (
        <ComposedChart {...commonProps} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid {...commonAxisProps.grid} />
          <XAxis {...commonAxisProps.xAxis} />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: "#A1A1AA", fontSize: 12 }}
            axisLine={{ stroke: "#6366F1" }}
            tickLine={{ stroke: "#3F3F46" }}
            tickFormatter={(value: number) => {
              if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
              if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
              return `${value}`;
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#A1A1AA", fontSize: 12 }}
            axisLine={{ stroke: "#22C55E" }}
            tickLine={{ stroke: "#3F3F46" }}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip dataType={dataType} isDual={true} />} />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenueGrowth"
            stroke="#22C55E"
            strokeWidth={2}
            dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#22C55E" }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </ComposedChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid {...commonAxisProps.grid} />
          <XAxis {...commonAxisProps.xAxis} />
          <YAxis {...commonAxisProps.yAxis} />
          <Tooltip content={<CustomTooltip dataType={dataType} />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: config.color }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid {...commonAxisProps.grid} />
          <XAxis {...commonAxisProps.xAxis} />
          <YAxis {...commonAxisProps.yAxis} />
          <Tooltip content={<CustomTooltip dataType={dataType} />} />
          <defs>
            <linearGradient id={`gradient-${dataType}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.gradient[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={config.gradient[1]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={config.color}
            strokeWidth={2}
            fill={`url(#gradient-${dataType})`}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid {...commonAxisProps.grid} />
        <XAxis {...commonAxisProps.xAxis} />
        <YAxis {...commonAxisProps.yAxis} />
        <Tooltip content={<CustomTooltip dataType={dataType} />} />
        <Bar
          dataKey={dataKey}
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {dataType === "revenue" && processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
          ))}
          {dataType !== "revenue" && <Cell fill={config.color} />}
        </Bar>
      </BarChart>
    );
  };

  return (
    <Card className={cn("overflow-hidden bg-surface border-border", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-xs text-text-tertiary">
                {processedData.length} 个季度数据
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-surface-secondary rounded-lg p-1">
              {( ["revenue", "eps", "growth"] as DataType[]).map((type) => {
                const TypeIcon = dataTypeConfig[type].icon;
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => setDataType(type)}
                    className={cn(
                      "h-8 px-2 text-xs",
                      dataType === type
                        ? "bg-surface-secondary text-white"
                        : "text-text-tertiary hover:text-white"
                    )}
                  >
                    <TypeIcon className="w-3.5 h-3.5 mr-1" />
                    {dataTypeConfig[type].label}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center bg-surface-secondary rounded-lg p-1">
              {(["bar", "line", "area", "dual"] as ChartType[]).map((type) => {
                const label = type === "dual" ? "双轴" : type === "bar" ? "柱状" : type === "line" ? "折线" : "面积";
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartType(type)}
                    className={cn(
                      "h-8 px-2 text-xs",
                      chartType === type
                        ? "bg-surface-secondary text-white"
                        : "text-text-tertiary hover:text-white"
                    )}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center bg-surface-secondary rounded-lg p-1">
              {(["1Y", "3Y", "5Y", "ALL"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "h-8 px-2 text-xs",
                    timeRange === range
                      ? "bg-surface-secondary text-white"
                      : "text-text-tertiary hover:text-white"
                  )}
                >
                  {range === "ALL" ? "全部" : range}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="h-8 border-border text-text-secondary hover:text-white hover:bg-surface-secondary"
            >
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default EarningsTrendChart;
