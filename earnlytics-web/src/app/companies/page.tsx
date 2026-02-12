import { supabase } from "@/lib/supabase";
import type { Company } from "@/types/database";
import CompaniesList from "./CompaniesList";

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
      console.error(`Error fetching earnings for ${company.symbol}:`, earningsError);
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

  return <CompaniesList companies={companies} />;
}
