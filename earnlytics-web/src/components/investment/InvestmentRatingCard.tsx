"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Clock,
} from "lucide-react";

export type InvestmentRating = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
export type ConfidenceLevel = "high" | "medium" | "low";
export type PriceTrend = "up" | "down" | "neutral";

interface CompanyLogoProps {
  symbol: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

function CompanyLogo({ symbol, name, size = "md" }: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  const clearbitUrl = `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };
  const sizePixels = { sm: 32, md: 48, lg: 64 };

  const firstLetter = symbol.charAt(0).toUpperCase();

  if (imageError) {
    return (
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-[#6366F1]/20 to-[#6366F1]/5",
          "flex items-center justify-center font-bold text-primary",
          "border border-primary/20",
          sizeClasses[size]
        )}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <Image
      src={clearbitUrl}
      alt={`${name || symbol} logo`}
      width={sizePixels[size]}
      height={sizePixels[size]}
      unoptimized
      className={cn("rounded-xl object-contain bg-surface", sizeClasses[size])}
      onError={() => setImageError(true)}
    />
  );
}

interface RatingBadgeProps {
  rating: InvestmentRating;
  size?: "sm" | "md" | "lg";
}

const ratingConfig: Record<InvestmentRating, {
  label: string;
  labelZh: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof TrendingUp;
}> = {
  strong_buy: {
    label: "Strong Buy",
    labelZh: "强烈买入",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: TrendingUp,
  },
  buy: {
    label: "Buy",
    labelZh: "买入",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: TrendingUp,
  },
  hold: {
    label: "Hold",
    labelZh: "持有",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Minus,
  },
  sell: {
    label: "Sell",
    labelZh: "卖出",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: TrendingDown,
  },
  strong_sell: {
    label: "Strong Sell",
    labelZh: "强烈卖出",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: TrendingDown,
  },
};

function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  const config = ratingConfig[rating];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold border",
        config.color,
        config.bgColor,
        config.borderColor,
        sizeClasses[size]
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{config.labelZh}</span>
    </div>
  );
}

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

const confidenceConfig: Record<ConfidenceLevel, {
  label: string;
  labelZh: string;
  color: string;
  bgColor: string;
}> = {
  high: {
    label: "High",
    labelZh: "高置信度",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  medium: {
    label: "Medium",
    labelZh: "中等置信度",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  low: {
    label: "Low",
    labelZh: "低置信度",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
};

function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-0",
        config.color,
        config.bgColor
      )}
    >
      {config.labelZh}
    </Badge>
  );
}

interface TrendIndicatorProps {
  trend: PriceTrend;
  value?: number;
}

function TrendIndicator({ trend, value }: TrendIndicatorProps) {
  const trendConfig = {
    up: { color: "text-emerald-400", icon: TrendingUp, label: "上涨" },
    down: { color: "text-red-400", icon: TrendingDown, label: "下跌" },
    neutral: { color: "text-amber-400", icon: Minus, label: "持平" },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1", config.color)}>
      <Icon className="w-4 h-4" />
      {value !== undefined && (
        <span className="font-medium">
          {value > 0 ? "+" : ""}
          {value.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

interface PriceDisplayProps {
  currentPrice: number;
  previousClose?: number;
  currency?: string;
}

function PriceDisplay({ currentPrice, previousClose, currency = "$" }: PriceDisplayProps) {
  if (currentPrice <= 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            --
          </span>
        </div>
        <p className="text-sm text-text-tertiary">
          股价数据暂不可用
        </p>
      </div>
    );
  }

  const change = previousClose ? currentPrice - previousClose : 0;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const trend: PriceTrend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          {currency}{currentPrice.toFixed(2)}
        </span>
        {previousClose && (
          <TrendIndicator trend={trend} value={changePercent} />
        )}
      </div>
      {previousClose && (
        <p className="text-sm text-text-tertiary">
          较前收 {currency}{previousClose.toFixed(2)} {change > 0 ? "+" : ""}
          {change.toFixed(2)} ({changePercent > 0 ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </p>
      )}
    </div>
  );
}

interface TargetPriceProps {
  low: number;
  high: number;
  currentPrice: number;
}

function TargetPrice({ low, high, currentPrice }: TargetPriceProps) {
  if (low <= 0 || high <= 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Target className="h-4 w-4 text-primary" />
          <span>目标价区间</span>
        </div>
        <div className="text-sm text-text-tertiary">
          目标价数据暂不可用
        </div>
      </div>
    );
  }

  const upsideLow = ((low - currentPrice) / currentPrice) * 100;
  const upsideHigh = ((high - currentPrice) / currentPrice) * 100;
  const midPrice = (low + high) / 2;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Target className="h-4 w-4 text-primary" />
        <span>目标价区间</span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-white">
          ${low.toFixed(2)} - ${high.toFixed(2)}
        </span>
        <span className="text-sm text-text-tertiary">(中位数: ${midPrice.toFixed(2)})</span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span
          className={cn(
            upsideLow >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          区间涨幅: {upsideLow >= 0 ? "+" : ""}
          {upsideLow.toFixed(1)}% ~ {upsideHigh >= 0 ? "+" : ""}
          {upsideHigh.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-2 bg-surface-secondary rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full"
          style={{
            left: `${Math.max(0, Math.min(100, ((currentPrice - low * 0.8) / (high * 1.2 - low * 0.8)) * 100))}%`,
            width: "4px",
          }}
        />
        <div
          className="absolute h-full bg-primary/30 rounded-full"
          style={{
            left: `${((low - low * 0.8) / (high * 1.2 - low * 0.8)) * 100}%`,
            width: `${((high - low) / (high * 1.2 - low * 0.8)) * 100}%`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-tertiary">
        <span>${low.toFixed(2)}</span>
        <span className="text-primary">当前</span>
        <span>${high.toFixed(2)}</span>
      </div>
    </div>
  );
}

interface KeyPointsSectionProps {
  points: string[];
  defaultExpanded?: boolean;
}

function KeyPointsSection({ points, defaultExpanded = false }: KeyPointsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const displayPoints = isExpanded ? points : points.slice(0, 3);

  if (points.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <CheckCircle className="h-4 w-4 text-primary" />
        <span>核心观点</span>
        <span className="text-text-tertiary font-normal">({points.length}条)</span>
      </div>

      <ul className="space-y-2">
        {displayPoints.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed"
          >
            <span className="text-primary mt-1">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {points.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary-hover hover:bg-primary/10 -ml-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              查看全部 {points.length} 条
            </>
          )}
        </Button>
      )}
    </div>
  );
}

interface DataSourceAttributionProps {
  source?: string;
  lastUpdated?: string;
  analystCount?: number;
}

function DataSourceAttribution({
  source = "AI分析",
  lastUpdated,
  analystCount,
}: DataSourceAttributionProps) {
  return (
    <div className="space-y-2 pt-4 border-t border-border">
      <div className="flex items-start gap-2 text-xs text-text-tertiary">
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>
          此投资建议基于{source}生成，仅供参考，不构成投资建议。投资有风险，入市需谨慎。
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-tertiary">
        {lastUpdated && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>更新于 {lastUpdated}</span>
          </div>
        )}
        {analystCount && (
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span>{analystCount} 位分析师参与</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface InvestmentRatingCardProps {
  symbol: string;
  name?: string;
  rating: InvestmentRating;
  confidence: ConfidenceLevel;
  targetPrice: {
    low: number;
    high: number;
  };
  currentPrice: number;
  previousClose?: number;
  keyPoints: string[];
  lastUpdated?: string;
  analystCount?: number;
  dataSource?: string;
  className?: string;
}

export function InvestmentRatingCard({
  symbol,
  name,
  rating,
  confidence,
  targetPrice,
  currentPrice,
  previousClose,
  keyPoints,
  lastUpdated,
  analystCount,
  dataSource,
  className,
}: InvestmentRatingCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden bg-surface border-border",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={symbol} name={name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{symbol}</h3>
                <ConfidenceBadge confidence={confidence} />
              </div>
              {name && <p className="text-sm text-text-tertiary">{name}</p>}
            </div>
          </div>
          <RatingBadge rating={rating} size="md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <PriceDisplay
          currentPrice={currentPrice}
          previousClose={previousClose}
        />

        <TargetPrice
          low={targetPrice.low}
          high={targetPrice.high}
          currentPrice={currentPrice}
        />

        <KeyPointsSection points={keyPoints} />

        <DataSourceAttribution
          source={dataSource === 'fmp' ? 'FMP API' : dataSource === 'sec' ? 'SEC EDGAR' : dataSource === 'sample' ? '样本数据' : 'AI分析'}
          lastUpdated={lastUpdated}
          analystCount={analystCount}
        />
      </CardContent>
    </Card>
  );
}

export {
  CompanyLogo,
  RatingBadge,
  ConfidenceBadge,
  TrendIndicator,
  PriceDisplay,
  TargetPrice,
  KeyPointsSection,
  DataSourceAttribution,
};
