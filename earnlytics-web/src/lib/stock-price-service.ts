import { createClient } from "@supabase/supabase-js";
import { fetchStockPriceFromYahoo, saveStockPrice } from "@/lib/stock-data";

const STALE_MS = 15 * 60 * 1000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export interface LatestStockPrice {
  symbol: string;
  price: number;
  change: number | null;
  change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  high_52w: number | null;
  low_52w: number | null;
  timestamp: string;
}

function normalizeSymbols(symbols: string[]) {
  return [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
}

function toLatestStockPrice(row: Partial<LatestStockPrice> & { symbol: string }): LatestStockPrice {
  return {
    symbol: row.symbol.toUpperCase(),
    price: Number(row.price || 0),
    change: row.change ?? null,
    change_percent: row.change_percent ?? null,
    volume: row.volume ?? null,
    market_cap: row.market_cap ?? null,
    pe_ratio: row.pe_ratio ?? null,
    high_52w: row.high_52w ?? null,
    low_52w: row.low_52w ?? null,
    timestamp: row.timestamp || new Date(0).toISOString(),
  };
}

export function isStockPriceStale(timestamp: string | null, staleMs = STALE_MS) {
  if (!timestamp) return true;
  const lastUpdateTime = new Date(timestamp).getTime();
  if (!Number.isFinite(lastUpdateTime)) return true;
  return Date.now() - lastUpdateTime > staleMs;
}

export async function getLatestStockPrices(symbols: string[]): Promise<Map<string, LatestStockPrice>> {
  const normalizedSymbols = normalizeSymbols(symbols);
  const priceMap = new Map<string, LatestStockPrice>();

  if (!supabase || normalizedSymbols.length === 0) {
    return priceMap;
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("get_latest_stock_prices", {
    symbols_input: normalizedSymbols,
  });

  if (!rpcError && Array.isArray(rpcData)) {
    for (const item of rpcData) {
      if (!item?.symbol) continue;
      const latest = toLatestStockPrice(item as Partial<LatestStockPrice> & { symbol: string });
      priceMap.set(latest.symbol, latest);
    }
    return priceMap;
  }

  const { data: rows, error: fallbackError } = await supabase
    .from("stock_prices")
    .select("symbol, price, change, change_percent, volume, market_cap, pe_ratio, high_52w, low_52w, timestamp")
    .in("symbol", normalizedSymbols)
    .order("symbol", { ascending: true })
    .order("timestamp", { ascending: false });

  if (fallbackError || !rows) {
    if (fallbackError) {
      console.error("getLatestStockPrices fallback error:", fallbackError);
    }
    return priceMap;
  }

  for (const row of rows) {
    const symbol = String(row.symbol || "").toUpperCase();
    if (!symbol || priceMap.has(symbol)) continue;
    priceMap.set(symbol, toLatestStockPrice({ ...row, symbol }));
  }

  return priceMap;
}

export async function getLatestStockPrice(symbol: string): Promise<LatestStockPrice | null> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  if (!normalizedSymbol) return null;

  const result = await getLatestStockPrices([normalizedSymbol]);
  return result.get(normalizedSymbol) || null;
}

export async function refreshStockPrice(symbol: string): Promise<LatestStockPrice | null> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  if (!normalizedSymbol) return null;

  const freshData = await fetchStockPriceFromYahoo(normalizedSymbol);
  if (!freshData) return null;

  await saveStockPrice(freshData);

  return {
    symbol: freshData.symbol.toUpperCase(),
    price: freshData.price,
    change: freshData.change,
    change_percent: freshData.changePercent,
    volume: freshData.volume,
    market_cap: freshData.marketCap,
    pe_ratio: freshData.peRatio,
    high_52w: freshData.high52w,
    low_52w: freshData.low52w,
    timestamp: freshData.timestamp,
  };
}
