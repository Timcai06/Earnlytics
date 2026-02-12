"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle } from "lucide-react";

export type InvestmentRating = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
export type ConfidenceLevel = "high" | "medium" | "low";

interface InvestmentRatingCardProps {
  symbol: string;
  rating: InvestmentRating;
  confidence: ConfidenceLevel;
  targetPrice: {
    low: number;
    high: number;
  };
  currentPrice: number;
  keyPoints: string[];
  className?: string;
}

const ratingConfig: Record<InvestmentRating, {
  label: string;
  labelZh: string;
  color: string;
  bgColor: string;
  icon: typeof TrendingUp;
}> = {
  strong_buy: {
    label: "Strong Buy",
    labelZh: "强烈买入",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: TrendingUp,
  },
  buy: {
    label: "Buy",
    labelZh: "买入",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: TrendingUp,
  },
  hold: {
    label: "Hold",
    labelZh: "持有",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: Minus,
  },
  sell: {
    label: "Sell",
    labelZh: "卖出",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: TrendingDown,
  },
  strong_sell: {
    label: "Strong Sell",
    labelZh: "强烈卖出",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: TrendingDown,
  },
};

const confidenceConfig: Record<ConfidenceLevel, {
  label: string;
  labelZh: string;
  color: string;
}> = {
  high: {
    label: "High",
    labelZh: "高置信度",
    color: "text-emerald-600",
  },
  medium: {
    label: "Medium",
    labelZh: "中等置信度",
    color: "text-amber-600",
  },
  low: {
    label: "Low",
    labelZh: "低置信度",
    color: "text-red-600",
  },
};

export function InvestmentRatingCard({
  symbol,
  rating,
  confidence,
  targetPrice,
  currentPrice,
  keyPoints,
  className,
}: InvestmentRatingCardProps) {
  const config = ratingConfig[rating];
  const confidenceConfig_data = confidenceConfig[confidence];
  const RatingIcon = config.icon;

  const upsideLow = ((targetPrice.low - currentPrice) / currentPrice) * 100;
  const upsideHigh = ((targetPrice.high - currentPrice) / currentPrice) * 100;

  return (
    <Card className={cn("overflow-hidden", config.bgColor, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <RatingIcon className={cn("h-5 w-5", config.color)} />
            投资建议
          </CardTitle>
          <Badge variant="outline" className={cn("font-medium", confidenceConfig_data.color)}>
            {confidenceConfig_data.labelZh}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-lg font-bold text-lg",
            config.color,
            "bg-white/60"
          )}>
            {config.labelZh}
          </div>
          <span className="text-sm text-muted-foreground">
            {config.label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>目标价区间</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              ${targetPrice.low.toFixed(2)} - ${targetPrice.high.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              (预期涨幅: {upsideLow > 0 ? '+' : ''}{upsideLow.toFixed(1)}% ~ {upsideHigh > 0 ? '+' : ''}{upsideHigh.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">当前价格:</span>
          <span className="font-semibold">${currentPrice.toFixed(2)}</span>
        </div>

        {keyPoints.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>核心观点</span>
            </div>
            <ul className="space-y-1.5">
              {keyPoints.slice(0, 3).map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            此投资建议基于AI分析生成，仅供参考，不构成投资建议。投资有风险，入市需谨慎。
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
