import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import DashboardClient from "./DashboardClient";
import {
  getDashboardCompanies,
  getInvestmentRecommendations,
} from "./dashboard-data";

export const metadata: Metadata = {
  title: "投资仪表盘 - Earnlytics",
  description: "AI驱动的投资决策辅助系统，基于五维度分析框架提供投资建议。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const [recommendations, companies] = await Promise.all([
    getInvestmentRecommendations(),
    getDashboardCompanies(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          投资仪表盘
        </h1>
        <p className="text-muted-foreground">
          AI驱动的投资决策辅助系统 - 基于五维度分析框架
        </p>
      </div>

      <DashboardClient
        initialRecommendations={recommendations}
        companies={companies}
      />
    </div>
  );
}
