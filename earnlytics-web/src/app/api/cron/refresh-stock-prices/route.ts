import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { refreshStockPricesBatch } from "@/lib/stock-price-service";

const DEFAULT_REFRESH_SYMBOLS = [
  "AAPL",
  "NVDA",
  "MSFT",
  "TSLA",
  "GOOGL",
  "META",
  "AMZN",
  "AMD",
  "INTC",
  "NFLX",
];

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const [companiesResult, portfoliosResult] = await Promise.all([
      supabase.from("companies").select("symbol"),
      supabase.from("user_portfolios").select("symbol"),
    ]);

    const symbols = new Set<string>(DEFAULT_REFRESH_SYMBOLS);
    (companiesResult.data || []).forEach((row) => {
      if (typeof row.symbol === "string") {
        symbols.add(row.symbol.toUpperCase());
      }
    });
    (portfoliosResult.data || []).forEach((row) => {
      if (typeof row.symbol === "string") {
        symbols.add(row.symbol.toUpperCase());
      }
    });

    const symbolList = Array.from(symbols);
    const refreshedMap = await refreshStockPricesBatch(symbolList);

    return NextResponse.json({
      ok: true,
      requested: symbolList.length,
      refreshed: refreshedMap.size,
      skipped: Math.max(symbolList.length - refreshedMap.size, 0),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron stock refresh failed:", error);
    return NextResponse.json(
      { error: "Cron stock refresh failed" },
      { status: 500 }
    );
  }
}

