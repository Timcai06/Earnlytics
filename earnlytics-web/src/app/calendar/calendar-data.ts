import { supabase } from "@/lib/supabase";

export interface CalendarEvent {
  id: number;
  date: string;
  symbol: string;
  companyName: string;
  fiscalYear: number;
  fiscalQuarter: number;
}

export async function fetchCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const { data, error } = await supabase
    .from("earnings")
    .select(`
      id,
      report_date,
      fiscal_year,
      fiscal_quarter,
      companies (
        symbol,
        name
      )
    `)
    .gte("report_date", startDate.toISOString().split("T")[0])
    .lte("report_date", endDate.toISOString().split("T")[0])
    .order("report_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((item) => {
    const company = Array.isArray(item.companies) ? item.companies[0] : item.companies;
    return {
      id: item.id,
      date: item.report_date,
      symbol: company?.symbol || "",
      companyName: company?.name || "",
      fiscalYear: item.fiscal_year,
      fiscalQuarter: item.fiscal_quarter,
    };
  });
}

