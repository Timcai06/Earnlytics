"use client";

import { InvestmentMemoPanel } from "@/components/investment/InvestmentMemoPanel";

interface AISummary {
  summary?: string;
  highlights?: string[] | null;
  concerns?: string[] | null;
}

interface Props {
  earningId: number;
  symbol: string;
  aiSummary?: AISummary;
}

export default function AnalysisMemoSectionClient({ earningId, symbol, aiSummary }: Props) {
  return (
    <InvestmentMemoPanel
      earningId={earningId}
      symbol={symbol}
      aiSummary={aiSummary}
    />
  );
}
