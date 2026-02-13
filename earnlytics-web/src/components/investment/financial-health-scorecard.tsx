"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Activity,
  Scale,
  Info,
} from "lucide-react";

interface RadialProgressProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: string;
}

function RadialProgress({
  value,
  size = "md",
  showValue = true,
  label,
}: RadialProgressProps) {
  const sizeClasses = {
    sm: { width: 60, strokeWidth: 4, fontSize: 14 },
    md: { width: 100, strokeWidth: 6, fontSize: 20 },
    lg: { width: 140, strokeWidth: 8, fontSize: 28 },
  };

  const { width, strokeWidth, fontSize } = sizeClasses[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return "#22C55E";
    if (val >= 60) return "#F59E0B";
    if (val >= 40) return "#F97316";
    return "#EF4444";
  };

  const color = getColor(value);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="transform -rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#27272A"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-bold"
              style={{ fontSize, color }}
            >
              {value}
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="mt-2 text-sm text-text-secondary">{label}</span>
      )}
    </div>
  );
}

interface ScoreIndicatorProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function ScoreIndicator({ score, size = "md" }: ScoreIndicatorProps) {
  const getScoreConfig = (val: number) => {
    if (val >= 80) return { label: "优秀", color: "text-emerald-400", bgColor: "bg-emerald-500/10" };
    if (val >= 60) return { label: "良好", color: "text-amber-400", bgColor: "bg-amber-500/10" };
    if (val >= 40) return { label: "一般", color: "text-orange-400", bgColor: "bg-orange-500/10" };
    return { label: "需关注", color: "text-red-400", bgColor: "bg-red-500/10" };
  };

  const config = getScoreConfig(score);

  return (
    <div className="flex items-center gap-2">
      <RadialProgress value={score} size={size} />
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

interface FactorCardProps {
  label: string;
  value: number;
  unit: string;
  icon: typeof DollarSign;
  description: string;
}

function FactorCard({ label, value, unit, icon: Icon, description }: FactorCardProps) {
  return (
    <div className="p-3 bg-surface-secondary rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-surface-secondary rounded-md">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">
        {value.toFixed(unit === "%" ? 1 : 2)}
        {unit}
      </div>
      <p className="mt-1 text-xs text-text-tertiary">{description}</p>
    </div>
  );
}

interface DuPontChartProps {
  netMargin: number;
  assetTurnover: number;
  equityMultiplier: number;
}

function DuPontChart({
  netMargin,
  assetTurnover,
  equityMultiplier,
}: DuPontChartProps) {
  const roe = netMargin * assetTurnover * equityMultiplier;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <FactorCard
          label="净利率"
          value={netMargin * 100}
          unit="%"
          icon={DollarSign}
          description="净利润/营收"
        />
        <FactorCard
          label="资产周转率"
          value={assetTurnover}
          unit="x"
          icon={Activity}
          description="营收/总资产"
        />
        <FactorCard
          label="权益乘数"
          value={equityMultiplier}
          unit="x"
          icon={Scale}
          description="总资产/股东权益"
        />
      </div>

      <div className="flex items-center justify-center gap-4 py-3 px-4 bg-surface-secondary rounded-lg border border-border">
        <div className="text-center">
          <span className="text-lg font-semibold text-emerald-400">
            {(netMargin * 100).toFixed(1)}%
          </span>
          <p className="text-xs text-text-tertiary">净利率</p>
        </div>
        <span className="text-text-tertiary text-xl">×</span>
        <div className="text-center">
          <span className="text-lg font-semibold text-blue-400">
            {assetTurnover.toFixed(2)}x
          </span>
          <p className="text-xs text-text-tertiary">资产周转</p>
        </div>
        <span className="text-text-tertiary text-xl">×</span>
        <div className="text-center">
          <span className="text-lg font-semibold text-purple-400">
            {equityMultiplier.toFixed(2)}x
          </span>
          <p className="text-xs text-text-tertiary">权益乘数</p>
        </div>
        <span className="text-text-tertiary text-xl">=</span>
        <div className="text-center px-3 py-1 bg-primary/10 rounded-lg border border-primary/30">
          <span className="text-xl font-bold text-primary">
            {(roe * 100).toFixed(1)}%
          </span>
          <p className="text-xs text-primary">ROE</p>
        </div>
      </div>
    </div>
  );
}

interface CashFlowBadgeProps {
  health: "healthy" | "moderate" | "concerning";
}

const cashFlowConfig = {
  healthy: {
    label: "健康",
    labelEn: "Healthy",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: TrendingUp,
    description: "经营现金流充裕，自由现金流为正",
  },
  moderate: {
    label: "中等",
    labelEn: "Moderate",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Minus,
    description: "经营现金流稳定，需关注资本支出",
  },
  concerning: {
    label: "需关注",
    labelEn: "Concerning",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: TrendingDown,
    description: "经营现金流承压，自由现金流为负",
  },
};

function CashFlowBadge({ health }: CashFlowBadgeProps) {
  const config = cashFlowConfig[health];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border",
        config.bgColor,
        config.borderColor
      )}
    >
      <Icon className={cn("w-4 h-4", config.color)} />
      <div className="flex flex-col">
        <span className={cn("font-medium text-sm", config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

interface CashFlowIndicatorProps {
  health: "healthy" | "moderate" | "concerning";
  operatingCashFlow?: number;
  freeCashFlow?: number;
}

function CashFlowIndicator({
  health,
  operatingCashFlow,
  freeCashFlow,
}: CashFlowIndicatorProps) {
  const config = cashFlowConfig[health];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">现金流状况</span>
        <CashFlowBadge health={health} />
      </div>

      <p className="text-sm text-text-secondary">{config.description}</p>

      {(operatingCashFlow !== undefined || freeCashFlow !== undefined) && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {operatingCashFlow !== undefined && (
            <div className="p-3 bg-surface-secondary rounded-lg">
              <span className="text-xs text-text-tertiary">经营现金流</span>
              <p
                className={cn(
                  "text-lg font-semibold",
                  operatingCashFlow >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {operatingCashFlow >= 0 ? "+" : ""}
                ${(operatingCashFlow / 1e9).toFixed(1)}B
              </p>
            </div>
          )}
          {freeCashFlow !== undefined && (
            <div className="p-3 bg-surface-secondary rounded-lg">
              <span className="text-xs text-text-tertiary">自由现金流</span>
              <p
                className={cn(
                  "text-lg font-semibold",
                  freeCashFlow >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {freeCashFlow >= 0 ? "+" : ""}
                ${(freeCashFlow / 1e9).toFixed(1)}B
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TrendBadgeProps {
  trend: "improving" | "stable" | "declining";
  label?: string;
}

function TrendBadge({ trend, label }: TrendBadgeProps) {
  const trendConfigs = {
    improving: {
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      icon: TrendingUp,
      defaultLabel: "改善中",
    },
    stable: {
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      icon: Minus,
      defaultLabel: "稳定",
    },
    declining: {
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      icon: TrendingDown,
      defaultLabel: "下滑",
    },
  };

  const config = trendConfigs[trend];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 font-medium border-0",
        config.color,
        config.bgColor
      )}
    >
      <Icon className="w-3 h-3" />
      {label || config.defaultLabel}
    </Badge>
  );
}

interface FinancialHealthScorecardProps {
  score: number;
  trend?: "improving" | "stable" | "declining";
  roeDuPont: {
    netMargin: number;
    assetTurnover: number;
    equityMultiplier: number;
  };
  cashFlowHealth: "healthy" | "moderate" | "concerning";
  operatingCashFlow?: number;
  freeCashFlow?: number;
  className?: string;
}

export function FinancialHealthScorecard({
  score,
  trend,
  roeDuPont,
  cashFlowHealth,
  operatingCashFlow,
  freeCashFlow,
  className,
}: FinancialHealthScorecardProps) {
  return (
    <Card className={cn("overflow-hidden bg-surface border-border", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HeartPulse className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">财务健康度</h3>
              <p className="text-xs text-text-tertiary">基于杜邦分析与现金流评估</p>
            </div>
          </div>
          {trend && <TrendBadge trend={trend} />}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-center py-4">
          <ScoreIndicator score={score} size="lg" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>杜邦分析 - ROE拆解</span>
            <Info className="h-3 w-3 text-text-tertiary" />
          </div>
          <DuPontChart
            netMargin={roeDuPont.netMargin}
            assetTurnover={roeDuPont.assetTurnover}
            equityMultiplier={roeDuPont.equityMultiplier}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <CashFlowIndicator
            health={cashFlowHealth}
            operatingCashFlow={operatingCashFlow}
            freeCashFlow={freeCashFlow}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export {
  RadialProgress,
  ScoreIndicator,
  DuPontChart,
  FactorCard,
  CashFlowBadge,
  CashFlowIndicator,
  TrendBadge,
};
