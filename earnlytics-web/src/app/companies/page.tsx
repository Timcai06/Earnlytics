import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { Company } from "@/types/database";
import CompaniesList from "./CompaniesList";

export const metadata: Metadata = {
  title: "公司列表 - Earnlytics | 30+科技公司财报",
  description: "浏览Earnlytics覆盖的所有科技公司，包括Apple、Microsoft、NVIDIA、Google、Meta等30+家公司的财报数据和AI分析。",
  keywords: ["科技公司", "美股公司", "公司列表", "财报数据", "AAPL", "MSFT", "NVDA", "GOOGL", "META"],
  openGraph: {
    title: "公司列表 - Earnlytics",
    description: "覆盖30+科技公司的财报数据和AI分析",
    url: "https://earnlytics-ebon.vercel.app/companies",
    siteName: "Earnlytics",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export interface CompanyWithEarnings extends Company {
  latestEarning?: {
    fiscal_year: number;
    fiscal_quarter: number;
    report_date: string;
    eps: number | null;
    eps_surprise: number | null;
    is_analyzed: boolean;
  } | null;
}

async function getCompaniesWithEarnings(): Promise<CompanyWithEarnings[]> {
  if (!supabase) return [];

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("*")
    .order("symbol", { ascending: true });

  if (companiesError) {
    console.error("Error fetching companies:", companiesError);
    return [];
  }

  if (!companies || companies.length === 0) {
    return [];
  }

  const companiesWithEarnings: CompanyWithEarnings[] = [];

  for (const company of companies) {
    const { data: latestEarning, error: earningsError } = await supabase
      .from("earnings")
      .select("fiscal_year, fiscal_quarter, report_date, eps, eps_surprise, is_analyzed")
      .eq("company_id", company.id)
      .not("revenue", "is", null)
      .order("report_date", { ascending: false })
      .limit(1)
      .single();

    if (earningsError && earningsError.code !== "PGRST116") {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error fetching earnings for ${company.symbol}:`, earningsError);
      }
    }

    companiesWithEarnings.push({
      ...company,
      latestEarning: latestEarning || null,
    });
  }

  return companiesWithEarnings;
}

export default async function CompaniesPage() {
  const companies = await getCompaniesWithEarnings();

  return (
    <Suspense fallback={
      <div className="flex flex-col">
        <section className="relative px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
          <div className="mx-auto max-w-7xl flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
              科技公司目录
            </h1>
            <p className="max-w-xl text-lg text-text-secondary mt-4">
              加载中...
            </p>
          </div>
        </section>
      </div>
    }>
      <CompaniesList companies={companies} />
    </Suspense>
  );
}
