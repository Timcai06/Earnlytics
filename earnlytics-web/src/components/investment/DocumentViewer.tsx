"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, Sparkles, AlertCircle, Loader2, ExternalLink } from "lucide-react";

interface DocumentViewerProps {
  documentId: string;
  symbol: string;
  filingType: string;
  filingDate: string;
  aiSummary?: {
    highlights: string[];
    keyMetrics: { label: string; value: string }[];
    sentiment: "positive" | "neutral" | "negative";
  };
  externalUrl?: string;
  isLoading?: boolean;
  className?: string;
}

export function DocumentViewer({
  symbol,
  filingType,
  filingDate,
  aiSummary,
  externalUrl,
  isLoading = false,
  className,
}: DocumentViewerProps) {
  const getSentimentConfig = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return { label: "积极", color: "bg-emerald-100 text-emerald-800" };
      case "negative":
        return { label: "消极", color: "bg-red-100 text-red-800" };
      default:
        return { label: "中性", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{symbol}</h3>
              <Badge variant="outline">{filingType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{filingDate}</p>
          </div>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4" />
              查看源文档
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {aiSummary?.sentiment && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">整体情绪:</span>
              <Badge className={getSentimentConfig(aiSummary.sentiment).color}>
                {getSentimentConfig(aiSummary.sentiment).label}
              </Badge>
            </div>
          )}

          {aiSummary?.highlights && aiSummary.highlights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                核心要点
              </h4>
              <ul className="space-y-2">
                {aiSummary.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiSummary?.keyMetrics && aiSummary.keyMetrics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">关键指标</h4>
              <div className="grid grid-cols-2 gap-3">
                {aiSummary.keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-xs text-muted-foreground block">{metric.label}</span>
                    <span className="text-lg font-semibold">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="border-t border-border/50 px-6 py-3 bg-muted/30">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            AI摘要仅供参考，不构成投资建议。查看完整财报请访问SEC EDGAR官网。
          </span>
        </div>
      </div>
    </Card>
  );
}
