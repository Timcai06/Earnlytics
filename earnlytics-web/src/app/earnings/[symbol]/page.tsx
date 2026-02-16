import type { Metadata } from "next";
import EarningsPageClient from "./EarningsPageClient";

interface Props {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} 财报分析 - Earnlytics`,
    description: `查看 ${symbol.toUpperCase()} 最新财报的AI深度分析，包括营收、EPS、增长趋势等关键指标。`,
  };
}

export default function EarningsPage({ params }: Props) {
  return <EarningsPageClient params={params} />;
}
