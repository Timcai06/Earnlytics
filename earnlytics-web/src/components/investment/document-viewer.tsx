"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, Sparkles, Columns, AlertCircle, Loader2 } from "lucide-react";

export type ViewMode = "ai" | "original" | "split";

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
  originalContent?: {
    sections: {
      title: string;
      content: string;
    }[];
  };
  isLoading?: boolean;
  className?: string;
}

export function DocumentViewer({
  documentId,
  symbol,
  filingType,
  filingDate,
  aiSummary,
  originalContent,
  isLoading = false,
  className,
}: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("ai");
  const [selectedSection, setSelectedSection] = useState(0);

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

  const renderAISummary = () => (
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
  );

  const renderOriginalContent = () => (
    <div className="space-y-4">
      {originalContent?.sections && originalContent.sections.length > 0 ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {originalContent.sections.map((section, index) => (
              <Button
                key={index}
                variant={selectedSection === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSection(index)}
                className="whitespace-nowrap"
              >
                {section.title}
              </Button>
            ))}
          </div>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-3">
              {originalContent.sections[selectedSection]?.title}
            </h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {originalContent.sections[selectedSection]?.content}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>原始文档内容加载中...</p>
        </div>
      )}
    </div>
  );

  const renderSplitView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border-r border-border/50 pr-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI 智能摘要
        </h4>
        {renderAISummary()}
      </div>
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          原始文档
        </h4>
        <div className="max-h-[600px] overflow-y-auto">
          {renderOriginalContent()}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">加载文档中...</p>
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
          <div className="flex gap-1">
            <Button
              variant={viewMode === "ai" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("ai")}
              className="gap-1"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI摘要</span>
            </Button>
            <Button
              variant={viewMode === "original" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("original")}
              className="gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">原文</span>
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
              className="gap-1"
            >
              <Columns className="h-4 w-4" />
              <span className="hidden sm:inline">对比</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {viewMode === "ai" && renderAISummary()}
        {viewMode === "original" && renderOriginalContent()}
        {viewMode === "split" && renderSplitView()}
      </CardContent>
      <div className="border-t border-border/50 px-6 py-3 bg-muted/30">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            原文档来源于SEC EDGAR官方数据库。AI摘要仅供参考，不构成投资建议。查看原始文档请访问SEC官网。
          </span>
        </div>
      </div>
    </Card>
  );
}
