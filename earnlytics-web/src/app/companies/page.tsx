import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { Company } from "@/types/database";
import CompaniesList from "./CompaniesList";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "公司列表 - Earnlytics | 30+科技公司财报",
  description: "浏览Earnlytics覆盖的所有科技公司，包括Apple、Microsoft、NVIDIA、Google、Meta等30+家公司的财报数据和AI分析。",
  keywords: ["科技公司", "美股公司", "公司列表", "财报数据", "AAPL", "MSFT", "NVDA", "GOOGL", "META"],
  openGraph: {
    title: "公司列表 - Earnlytics",
    description: "覆盖30+科技公司的财报数据和AI分析",
    url: `${siteUrl}/companies`,
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

  const companyIds = companies.map((company) => company.id);
  const { data: earningsRows, error: earningsError } = await supabase
    .from("earnings")
    .select("company_id, fiscal_year, fiscal_quarter, report_date, eps, eps_surprise, is_analyzed")
    .in("company_id", companyIds)
    .not("revenue", "is", null)
    .order("report_date", { ascending: false });

  if (earningsError && process.env.NODE_ENV === "development") {
    console.error("Error fetching latest earnings in bulk:", earningsError);
  }

  const latestEarningsMap = new Map<number, CompanyWithEarnings["latestEarning"]>();
  (earningsRows || []).forEach((row) => {
    if (!latestEarningsMap.has(row.company_id)) {
      latestEarningsMap.set(row.company_id, {
        fiscal_year: row.fiscal_year,
        fiscal_quarter: row.fiscal_quarter,
        report_date: row.report_date,
        eps: row.eps,
        eps_surprise: row.eps_surprise,
        is_analyzed: row.is_analyzed,
      });
    }
  });

  return companies.map((company) => ({
    ...company,
    latestEarning: latestEarningsMap.get(company.id) || null,
  }));
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
