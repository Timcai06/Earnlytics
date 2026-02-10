import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/types/database";
import CompaniesList from "./CompaniesList";

async function getCompanies(): Promise<Company[]> {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("symbol", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }

  return companies || [];
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return <CompaniesList companies={companies} />;
}
