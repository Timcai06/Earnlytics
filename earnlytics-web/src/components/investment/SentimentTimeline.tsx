"use client";

import { useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUpIcon, ClockIcon, ChevronRightIcon } from "@/components/icons";
import { ChartSkeleton } from "@/components/ui/skeleton";

type Sentiment = 'positive' | 'neutral' | 'negative';

interface QuarterData {
  quarter: string;
  fiscal_year: number;
  fiscal_quarter: number;
  sentiment: Sentiment | null;
  revenue: number | null;
  eps: number | null;
  revenue_yoy_growth: number | null;
  eps_surprise: number | null;
  ai_summary_preview: string;
  earning_id: number;
  report_date: string;
}

interface TrendAnalysis {
  positive_streak: number;
  negative_streak: number;
  sentiment_changes: number;
  overall_trend: 'improving' | 'declining' | 'stable';
}

interface SentimentTimelineProps {
  data: QuarterData[];
  trendAnalysis?: TrendAnalysis;
  onQuarterClick?: (earningId: number) => void;
  className?: string;
  isLoading?: boolean;
  maxQuarters?: number;
}

const sentimentConfig = {
  positive: {
    color: "#22C55E",
    bgColor: "bg-success/20",
    borderColor: "border-success",
    textColor: "text-success",
    label: "积极",
  },
  neutral: {
    color: "#F59E0B",
    bgColor: "bg-warning/20",
    borderColor: "border-warning",
    textColor: "text-warning",
    label: "中性",
  },
  negative: {
    color: "#EF4444",
    bgColor: "bg-error/20",
    borderColor: "border-error",
    textColor: "text-error",
    label: "消极",
  },
};

function formatQuarter(year: number, quarter: number): string {
  return `Q${quarter}'${year.toString().slice(2)}`;
}

function TooltipContent({ data, sentiment }: { data: QuarterData; sentiment: Sentiment | null }) {
  const config = sentiment ? sentimentConfig[sentiment] : null;
  
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-semibold">{formatQuarter(data.fiscal_year, data.fiscal_quarter)}</span>
        {config && (
          <span className={cn("text-xs px-2 py-0.5 rounded", config.bgColor, config.textColor)}>
            {config.label}
          </span>
        )}
      </div>
      
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">营收</span>
          <span className="text-white font-medium">{formatCurrency(data.revenue)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-secondary">EPS</span>
          <span className="text-white font-medium">
            {data.eps !== null ? `$${data.eps.toFixed(2)}` : 'N/A'}
          </span>
        </div>
        
        {data.revenue_yoy_growth !== null && (
          <div className="flex justify-between">
            <span className="text-text-secondary">同比增长</span>
            <span className={cn(
              "font-medium",
              data.revenue_yoy_growth >= 0 ? "text-success" : "text-error"
            )}>
              {data.revenue_yoy_growth > 0 ? '+' : ''}{data.revenue_yoy_growth.toFixed(1)}%
            </span>
          </div>
        )}
        
        {data.eps_surprise !== null && (
          <div className="flex justify-between">
            <span className="text-text-secondary">EPS超预期</span>
            <span className={cn(
              "font-medium",
              data.eps_surprise >= 0 ? "text-success" : "text-error"
            )}>
              {data.eps_surprise > 0 ? '+' : ''}{data.eps_surprise.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      
      {data.ai_summary_preview && (
        <p className="mt-2 pt-2 border-t border-border text-xs text-text-secondary line-clamp-2">
          {data.ai_summary_preview}
        </p>
      )}
      
      <p className="mt-2 text-xs text-text-tertiary">点击查看详情</p>
    </div>
  );
}

export function SentimentTimeline({
  data,
  trendAnalysis,
  onQuarterClick,
  className,
  isLoading = false,
  maxQuarters = 8,
}: SentimentTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime())
      .slice(-maxQuarters);
  }, [data, maxQuarters]);

  if (isLoading) {
    return <ChartSkeleton className={className} />;
  }

  if (sortedData.length === 0) {
    return (
      <Card className={cn("bg-surface border-border", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-text-secondary">暂无情绪历史数据</p>
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
              <TrendingUpIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">财报情绪时间轴</h3>
              <p className="text-xs text-text-tertiary flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {sortedData.length} 个季度
              </p>
            </div>
          </div>
          
          {trendAnalysis && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded",
                trendAnalysis.overall_trend === 'improving' && "bg-success/20 text-success",
                trendAnalysis.overall_trend === 'declining' && "bg-error/20 text-error",
                trendAnalysis.overall_trend === 'stable' && "bg-warning/20 text-warning"
              )}>
                {trendAnalysis.overall_trend === 'improving' && '上升趋势'}
                {trendAnalysis.overall_trend === 'declining' && '下降趋势'}
                {trendAnalysis.overall_trend === 'stable' && '稳定'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="text-text-tertiary">图例:</span>
          {Object.entries(sentimentConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: config.color }}
              />
              <span className="text-text-secondary">{config.label}</span>
            </div>
          ))}
        </div>
        
        <div className="relative overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-fit">
            {sortedData.map((item, index) => {
              const sentiment = item.sentiment;
              const config = sentiment ? sentimentConfig[sentiment] : null;
              const isHovered = hoveredIndex === index;
              const isFirst = index === 0;
              const isLast = index === sortedData.length - 1;
              
              let connectorColor = "bg-border";
              if (index > 0) {
                const prevSentiment = sortedData[index - 1].sentiment;
                if (prevSentiment !== sentiment && sentiment && prevSentiment) {
                  connectorColor = sentiment === 'positive' ? "bg-success/50" : 
                                   sentiment === 'negative' ? "bg-error/50" : "bg-warning/50";
                } else if (sentiment === 'positive') {
                  connectorColor = "bg-success/30";
                } else if (sentiment === 'negative') {
                  connectorColor = "bg-error/30";
                }
              }
              
              return (
                <div key={item.earning_id} className="flex items-center">
                  {!isFirst && (
                    <div className={cn("h-0.5 w-6", connectorColor)} />
                  )}
                  
                  <div
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onQuarterClick?.(item.earning_id)}
                  >
                    <div
                      className={cn(
                        "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                        isHovered && "scale-110",
                        config ? [
                          config.borderColor,
                          config.bgColor,
                        ] : [
                          "border-border",
                          "bg-surface-secondary",
                        ]
                      )}
                    >
                      {config ? (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-text-tertiary" />
                      )}
                    </div>
                    
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-xs font-medium text-white">
                        {formatQuarter(item.fiscal_year, item.fiscal_quarter)}
                      </span>
                    </div>
                    
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                        <TooltipContent data={item} sentiment={sentiment} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="w-2 h-2 rotate-45 bg-surface border-r border-b border-border" />
                        </div>
                      </div>
                    )}
                    
                    {index > 0 && sortedData[index - 1].sentiment !== sentiment && sentiment && sortedData[index - 1].sentiment && (
                      <div 
                        className="absolute -top-1 -right-1"
                        style={{ 
                          transform: sentiment === 'positive' ? 'rotate(-45deg)' : 
                                     sentiment === 'negative' ? 'rotate(45deg)' : 'rotate(0deg)'
                        }}
                      >
                        <ChevronRightIcon 
                          className={cn(
                            "h-3 w-3",
                            sentiment === 'positive' ? "text-success" : 
                            sentiment === 'negative' ? "text-error" : "text-warning"
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {isLast && (
                    <div className="h-0.5 w-6 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {trendAnalysis && (
          <div className="mt-8 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{trendAnalysis.positive_streak}</p>
              <p className="text-xs text-text-secondary">连续积极季度</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-error">{trendAnalysis.negative_streak}</p>
              <p className="text-xs text-text-secondary">连续消极季度</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{trendAnalysis.sentiment_changes}</p>
              <p className="text-xs text-text-secondary">情绪变化次数</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SentimentTimeline;
