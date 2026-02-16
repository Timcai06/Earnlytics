"use client";

import { useState, useMemo, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
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
  Layers,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ChartSkeleton } from "@/components/ui/skeleton";

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
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
}

function filterDataByTimeRange(data: TrendData[], range: TimeRange): TrendData[] {
  if (range === "ALL" || data.length === 0) return data;

  // Use latest data date instead of current date for accurate filtering
  const latestDate = new Date(Math.max(...data.map(d => new Date(d.date).getTime())));
  const years = range === "1Y" ? 1 : range === "3Y" ? 3 : 5;
  const cutoffDate = new Date(latestDate.getFullYear() - years, latestDate.getMonth(), latestDate.getDate());

  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

function calculateQoQGrowth(data: TrendData[]): TrendData[] {
  return data.map((item, index) => {
    if (index === 0) return { ...item, qoqGrowth: null };

    // FIX #2: Find the actual previous quarter by time order (not just array index)
    const prevItem = data[index - 1];
    const currDate = new Date(item.date);
    const prevDate = new Date(prevItem.date);

    // Validate if quarters are consecutive (~90 days apart, allow 80-100 day range)
    const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    const isConsecutiveQuarter = daysDiff >= 80 && daysDiff <= 100;

    // Don't calculate QoQ if not consecutive (e.g., cross fiscal year: FY23 Q4 -> FY24 Q1)
    if (!isConsecutiveQuarter) {
      return { ...item, qoqGrowth: null };
    }

    const prevRevenue = prevItem.revenue;
    const currRevenue = item.revenue;

    // FIX #2: Add division by zero check
    if (!prevRevenue || !currRevenue || prevRevenue === 0) {
      return { ...item, qoqGrowth: null };
    }

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
  isLoading = false,
  error = null,
  onRefresh,
  autoRefresh = false,
  autoRefreshInterval = 300000,
}: EarningsTrendChartProps) {
  // FIX #9: Persist chart configuration to localStorage
  const [chartType, setChartType] = useState<ChartType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('earnings-chart-config');
      if (saved) {
        const config = JSON.parse(saved);
        return config.chartType || 'bar';
      }
    }
    return 'bar';
  });
  const [dataType, setDataType] = useState<DataType>(defaultType);
  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('earnings-chart-config');
      if (saved) {
        const config = JSON.parse(saved);
        return config.timeRange || 'ALL';
      }
    }
    return 'ALL';
  });
  const [isAnimating, setIsAnimating] = useState(false);
  // FIX #6: Add data point selection for interactivity
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  // FIX #4: Dynamic animation configuration based on device performance
  const animationConfig = useMemo(() => {
    if (typeof window === 'undefined') return { duration: 1000, isAnimationActive: true };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return { duration: 0, isAnimationActive: false };

    // Reduce animation duration on mobile for better performance
    const isMobile = window.innerWidth < 768;
    return {
      duration: isMobile ? 300 : 600,
      isAnimationActive: true
    };
  }, []);

  // FIX #1: Use layered memoization for better performance
  // Each layer only recalculates when its specific dependency changes
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const filteredData = useMemo(() => {
    return filterDataByTimeRange(sortedData, timeRange);
  }, [sortedData, timeRange]);

  const processedData = useMemo(() => {
    return calculateQoQGrowth(filteredData);
  }, [filteredData]);

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
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
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(processedData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `earnings-trend-${dataType}-${timeRange}.json`;
      link.click();
    }
  };

  // Save chart configuration to localStorage
  useEffect(() => {
    localStorage.setItem('earnings-chart-config', JSON.stringify({
      chartType,
      timeRange,
    }));
  }, [chartType, timeRange]);

  // FIX #13: Auto refresh mechanism
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const intervalId = setInterval(() => {
      onRefresh();
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, autoRefreshInterval, onRefresh]);

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

  const chartTypeIcons = {
    bar: BarChart3,
    line: LineChartIcon,
    area: AreaChartIcon,
    dual: Layers,
  };

  const config = dataTypeConfig[dataType];

  const latestData = processedData[processedData.length - 1];

  const getMetricValue = () => {
    if (!latestData) return null;
    switch (dataType) {
      case 'revenue':
        return { value: latestData.revenue, growth: latestData.revenueGrowth, label: '营收' };
      case 'eps':
        return { value: latestData.eps, growth: null, label: 'EPS' };
      case 'growth':
        return { value: latestData.revenueGrowth, growth: null, label: '同比增长' };
      default:
        return null;
    }
  };

  const currentMetric = getMetricValue();

  const getBarColor = (entry: TrendData) => {
    const growth = entry.revenueGrowth;
    if (growth === null || growth === undefined) return "#6366F1";
    return growth >= 0 ? "#22C55E" : "#EF4444";
  };

  // FIX #12: Loading state
  if (isLoading) {
    return <ChartSkeleton className={className} />;
  }

  // FIX #12: Error state
  if (error) {
    return (
      <Card className={cn("overflow-hidden bg-surface border-border", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4">
          <div className="p-3 bg-error/10 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">加载失败</h3>
          <p className="text-sm text-text-secondary text-center max-w-sm mb-4">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-border/50 text-text-secondary hover:text-white hover:bg-surface-secondary"
          >
            <Loader2 className="h-4 w-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

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
            animationDuration={isAnimating ? 0 : animationConfig.duration}
            animationEasing="ease-out"
            isAnimationActive={!isAnimating && animationConfig.isAnimationActive}
            onClick={(data) => setSelectedPoint(data.quarter)}
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry)}
                opacity={selectedPoint === entry.quarter ? 1 : 0.8}
                cursor="pointer"
              />
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
            animationDuration={isAnimating ? 0 : animationConfig.duration}
            animationEasing="ease-out"
            isAnimationActive={!isAnimating && animationConfig.isAnimationActive}
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
            animationDuration={isAnimating ? 0 : animationConfig.duration}
            animationEasing="ease-out"
            isAnimationActive={!isAnimating && animationConfig.isAnimationActive}
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
            animationDuration={isAnimating ? 0 : animationConfig.duration}
            animationEasing="ease-out"
            isAnimationActive={!isAnimating && animationConfig.isAnimationActive}
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
          animationDuration={isAnimating ? 0 : animationConfig.duration}
          animationEasing="ease-out"
          isAnimationActive={!isAnimating && animationConfig.isAnimationActive}
          onClick={(data) => setSelectedPoint(data.quarter)}
        >
          {dataType === "revenue" && processedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry)}
              opacity={selectedPoint === entry.quarter ? 1 : 0.8}
              cursor="pointer"
            />
          ))}
          {dataType !== "revenue" && <Cell fill={config.color} cursor="pointer" />}
        </Bar>
      </BarChart>
    );
  };

  return (
    <Card className={cn("overflow-hidden bg-surface border-border", className)}>
      {/* Header with Key Metrics */}
      <CardHeader className="pb-3 space-y-4">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-xs text-text-tertiary flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {processedData.length} 个季度数据
              </p>
            </div>
          </div>
          
          {currentMetric && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {dataType === 'eps' ? `$${currentMetric.value?.toFixed(2) || '--'}` : 
                 dataType === 'growth' ? `${currentMetric.value?.toFixed(1) || '--'}%` :
                 formatCurrency(currentMetric.value)}
              </div>
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-text-tertiary">{currentMetric.label}</span>
                {currentMetric.growth !== null && currentMetric.growth !== undefined && (
                  <span className={currentMetric.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {currentMetric.growth > 0 ? '+' : ''}{currentMetric.growth.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control Panel - Layer 1: Data Type */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">指标</span>
            <div className="flex items-center gap-1 bg-surface-secondary/50 rounded-lg p-1">
              {( ["revenue", "eps", "growth"] as DataType[]).map((type) => {
                const TypeIcon = dataTypeConfig[type].icon;
                const isActive = dataType === type;
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isAnimating) return;
                      setIsAnimating(true);
                      setDataType(type);
                      setTimeout(() => setIsAnimating(false), 300);
                    }}
                    className={cn(
                      "h-7 px-3 text-xs font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                        : "text-text-secondary hover:text-white hover:bg-surface-secondary"
                    )}
                  >
                    <TypeIcon className={cn("h-3.5 w-3.5 mr-1.5", isActive && "text-white")} />
                    {dataTypeConfig[type].label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Control Panel - Layer 2: Chart Type & Time Range */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">图表</span>
              <div className="flex items-center gap-1 bg-surface-secondary/50 rounded-lg p-1">
                {(["bar", "line", "area", "dual"] as ChartType[]).map((type) => {
                  const Icon = chartTypeIcons[type];
                  const isActive = chartType === type;
                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isAnimating) return;
                        setIsAnimating(true);
                        setChartType(type);
                        setTimeout(() => setIsAnimating(false), 300);
                      }}
                      className={cn(
                        "h-7 w-7 p-0 transition-all duration-200",
                        isActive
                          ? "bg-surface-secondary text-white"
                          : "text-text-tertiary hover:text-white hover:bg-surface-secondary"
                      )}
                      title={type === "dual" ? "双轴" : type === "bar" ? "柱状图" : type === "line" ? "折线图" : "面积图"}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">时间</span>
              <div className="flex items-center gap-1 bg-surface-secondary/50 rounded-lg p-1">
                {(["1Y", "3Y", "5Y", "ALL"] as TimeRange[]).map((range) => {
                  const isActive = timeRange === range;
                  return (
                    <Button
                      key={range}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isAnimating) return;
                        setIsAnimating(true);
                        setTimeRange(range);
                        setTimeout(() => setIsAnimating(false), 300);
                      }}
                      className={cn(
                        "h-7 px-2.5 text-xs font-medium transition-all duration-200",
                        isActive
                          ? "bg-surface-secondary text-white"
                          : "text-text-tertiary hover:text-white hover:bg-surface-secondary"
                      )}
                    >
                      {range === "ALL" ? "全部" : range}
                    </Button>
                  );
                })}
              </div>
              
              {/* FIX #13: Manual refresh button */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-7 px-2.5 border-border/50 text-text-secondary hover:text-white hover:bg-surface-secondary text-xs"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isLoading && "animate-spin")} />
                  刷新
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('csv')}
                className="h-7 px-2.5 border-border/50 text-text-secondary hover:text-white hover:bg-surface-secondary text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        {dataType === 'revenue' && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-text-tertiary">图例:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-text-secondary">增长</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span className="text-text-secondary">下降</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default EarningsTrendChart;
