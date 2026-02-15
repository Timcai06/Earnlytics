import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "财报分析 - Earnlytics",
  description: "查看美国科技公司财报数据和AI分析报告，包括营收、EPS、净利润等关键财务指标。",
  robots: {
    index: true,
    follow: true,
  },
};

export default function EarningsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
