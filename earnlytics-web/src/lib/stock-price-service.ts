import { createClient } from "@supabase/supabase-js";
import {
  fetchStockPriceFromYahoo,
  fetchStockPricesFromYahooBatch,
  saveStockPrice,
  saveStockPricesBatch,
} from "@/lib/stock-data";

const STALE_MS = 15 * 60 * 1000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;
const inFlightRefresh = new Map<string, Promise<LatestStockPrice | null>>();
const REFRESH_BATCH_SIZE = 50;

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

function toLatestFromStockData(row: {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number | null;
  peRatio: number | null;
  high52w: number | null;
  low52w: number | null;
  timestamp: string;
}): LatestStockPrice {
  return {
    symbol: row.symbol.toUpperCase(),
    price: row.price,
    change: row.change,
    change_percent: row.changePercent,
    volume: row.volume,
    market_cap: row.marketCap,
    pe_ratio: row.peRatio,
    high_52w: row.high52w,
    low_52w: row.low52w,
    timestamp: row.timestamp,
  };
}

async function refreshSymbolsBatch(symbols: string[]): Promise<Map<string, LatestStockPrice>> {
  const refreshedMap = new Map<string, LatestStockPrice>();
  if (symbols.length === 0) return refreshedMap;

  const chunks: string[][] = [];
  for (let idx = 0; idx < symbols.length; idx += REFRESH_BATCH_SIZE) {
    chunks.push(symbols.slice(idx, idx + REFRESH_BATCH_SIZE));
  }

  const batchLists = await Promise.all(chunks.map((chunk) => fetchStockPricesFromYahooBatch(chunk)));
  const batchBySymbol = new Map(
    batchLists.flat().map((row) => [row.symbol.toUpperCase(), row])
  );

  const missingSymbols = symbols.filter((symbol) => !batchBySymbol.has(symbol));
  if (missingSymbols.length > 0) {
    const fallbackRows = await Promise.all(missingSymbols.map((symbol) => fetchStockPriceFromYahoo(symbol)));
    for (const row of fallbackRows) {
      if (!row) continue;
      batchBySymbol.set(row.symbol.toUpperCase(), row);
    }
  }

  const rowsToSave = [...batchBySymbol.values()];
  if (rowsToSave.length > 0) {
    await saveStockPricesBatch(rowsToSave);
    rowsToSave.forEach((row) => {
      refreshedMap.set(row.symbol.toUpperCase(), toLatestFromStockData(row));
    });
  }

  return refreshedMap;
}

export async function refreshStockPricesBatch(symbols: string[]): Promise<Map<string, LatestStockPrice>> {
  const normalizedSymbols = normalizeSymbols(symbols);
  const resultMap = new Map<string, LatestStockPrice>();
  if (normalizedSymbols.length === 0) return resultMap;

  const pendingSymbols: string[] = [];
  const promiseMap = new Map<string, Promise<LatestStockPrice | null>>();

  normalizedSymbols.forEach((symbol) => {
    const existing = inFlightRefresh.get(symbol);
    if (existing) {
      promiseMap.set(symbol, existing);
      return;
    }
    pendingSymbols.push(symbol);
  });

  if (pendingSymbols.length > 0) {
    const batchPromise = refreshSymbolsBatch(pendingSymbols);

    pendingSymbols.forEach((symbol) => {
      const symbolPromise = batchPromise.then((rows) => rows.get(symbol) || null);
      inFlightRefresh.set(symbol, symbolPromise);
      promiseMap.set(symbol, symbolPromise);
      symbolPromise.finally(() => {
        if (inFlightRefresh.get(symbol) === symbolPromise) {
          inFlightRefresh.delete(symbol);
        }
      });
    });
  }

  const rows = await Promise.all(
    normalizedSymbols.map(async (symbol) => {
      const promise = promiseMap.get(symbol);
      if (!promise) return null;
      return promise;
    })
  );

  rows.forEach((row) => {
    if (!row) return;
    resultMap.set(row.symbol, row);
  });

  return resultMap;
}

export async function refreshStockPrice(symbol: string): Promise<LatestStockPrice | null> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  if (!normalizedSymbol) return null;

  const existingPromise = inFlightRefresh.get(normalizedSymbol);
  if (existingPromise) {
    return existingPromise;
  }

  const refreshPromise = (async () => {
    const freshData = await fetchStockPriceFromYahoo(normalizedSymbol);
    if (!freshData) return null;

    await saveStockPrice(freshData);

    return toLatestFromStockData(freshData);
  })();

  inFlightRefresh.set(normalizedSymbol, refreshPromise);
  try {
    return await refreshPromise;
  } finally {
    if (inFlightRefresh.get(normalizedSymbol) === refreshPromise) {
      inFlightRefresh.delete(normalizedSymbol);
    }
  }
}
