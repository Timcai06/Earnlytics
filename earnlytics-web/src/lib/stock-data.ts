import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const YAHOO_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://finance.yahoo.com',
    'Origin': 'https://finance.yahoo.com',
    'Connection': 'keep-alive',
}

export interface StockData {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: number
    marketCap: number | null
    peRatio: number | null
    high52w: number | null
    low52w: number | null
    timestamp: string
}

interface YahooQuoteItem {
    symbol?: string
    regularMarketPrice?: number | null
    regularMarketChange?: number | null
    regularMarketChangePercent?: number | null
    regularMarketPreviousClose?: number | null
    regularMarketVolume?: number | null
    marketCap?: number | null
    trailingPE?: number | null
    fiftyTwoWeekHigh?: number | null
    fiftyTwoWeekLow?: number | null
}

interface YahooQuoteResponse {
    quoteResponse?: {
        result?: YahooQuoteItem[]
    }
}

function asFiniteNumber(value: unknown): number | null {
    if (typeof value !== 'number') return null
    if (!Number.isFinite(value)) return null
    return value
}

function toStockDataFromQuote(item: YahooQuoteItem, timestamp: string): StockData | null {
    const symbol = typeof item.symbol === 'string' ? item.symbol.toUpperCase() : ''
    const price = asFiniteNumber(item.regularMarketPrice)
    if (!symbol || !price || price <= 0) {
        return null
    }

    const previousClose = asFiniteNumber(item.regularMarketPreviousClose)
    const explicitChange = asFiniteNumber(item.regularMarketChange)
    const explicitChangePercent = asFiniteNumber(item.regularMarketChangePercent)

    const change =
        explicitChange ??
        (previousClose && previousClose !== 0 ? price - previousClose : 0)

    const changePercent =
        explicitChangePercent ??
        (previousClose && previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0)

    return {
        symbol,
        price,
        change,
        changePercent,
        volume: asFiniteNumber(item.regularMarketVolume) ?? 0,
        marketCap: asFiniteNumber(item.marketCap),
        peRatio: asFiniteNumber(item.trailingPE),
        high52w: asFiniteNumber(item.fiftyTwoWeekHigh),
        low52w: asFiniteNumber(item.fiftyTwoWeekLow),
        timestamp,
    }
}

/**
 * Fetch real stock price from Yahoo Finance with improved headers
 */
export async function fetchStockPriceFromYahoo(symbol: string): Promise<StockData | null> {
    try {
        // Use quote endpoint with proper headers to avoid 401
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`

        const response = await fetch(url, {
            headers: YAHOO_HEADERS,
            next: { revalidate: 60 }
        })

        if (!response.ok) {
            console.warn(`Yahoo API returned ${response.status} for ${symbol}`)
            return null
        }

        const data = await response.json()
        const result = data.chart?.result?.[0]

        if (!result || !result.meta || !result.timestamp || result.timestamp.length === 0) {
            console.warn(`No data found for ${symbol}`)
            return null
        }

        const meta = result.meta
        const quote = result.indicators?.quote?.[0]

        // Get the last valid close price
        const closes = quote?.close || []
        const lastClose = closes[closes.length - 1] || meta.previousClose || 0
        const previousClose = meta.previousClose || meta.chartPreviousClose || 0

        // Calculate change
        const change = lastClose - previousClose
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

        return {
            symbol: symbol.toUpperCase(),
            price: lastClose,
            change: change,
            changePercent: changePercent,
            volume: meta.regularMarketVolume || 0,
            marketCap: null, // Not available in chart endpoint
            peRatio: null, // Not available in chart endpoint
            high52w: null, // Not available in chart endpoint
            low52w: null, // Not available in chart endpoint
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error)
        return null
    }
}

export async function fetchStockPricesFromYahooBatch(symbols: string[]): Promise<StockData[]> {
    try {
        const normalizedSymbols = [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))]
        if (normalizedSymbols.length === 0) {
            return []
        }

        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(normalizedSymbols.join(','))}`
        const response = await fetch(url, {
            headers: YAHOO_HEADERS,
            next: { revalidate: 60 }
        })

        if (!response.ok) {
            console.warn(`Yahoo batch API returned ${response.status} for ${normalizedSymbols.length} symbols`)
            return []
        }

        const data = await response.json() as YahooQuoteResponse
        const quoteItems = data.quoteResponse?.result || []
        if (quoteItems.length === 0) {
            return []
        }

        const timestamp = new Date().toISOString()
        return quoteItems
            .map((item) => toStockDataFromQuote(item, timestamp))
            .filter((item): item is StockData => item !== null)
    } catch (error) {
        console.error('Error fetching stock prices batch from Yahoo:', error)
        return []
    }
}

/**
 * Save stock price to Supabase
 */
export async function saveStockPrice(priceData: StockData) {
    try {
        const { error } = await supabase
            .from('stock_prices')
            .insert({
                symbol: priceData.symbol,
                price: priceData.price,
                change: priceData.change,
                change_percent: priceData.changePercent,
                volume: priceData.volume,
                market_cap: priceData.marketCap,
                pe_ratio: priceData.peRatio,
                high_52w: priceData.high52w,
                low_52w: priceData.low52w
            })

        if (error) {
            console.error('Error saving stock price:', error)
        }
    } catch (error) {
        console.error('Error saving stock price:', error)
    }
}

export async function saveStockPricesBatch(priceDataList: StockData[]) {
    if (priceDataList.length === 0) {
        return
    }

    const rows = priceDataList.map((priceData) => ({
        symbol: priceData.symbol,
        price: priceData.price,
        change: priceData.change,
        change_percent: priceData.changePercent,
        volume: priceData.volume,
        market_cap: priceData.marketCap,
        pe_ratio: priceData.peRatio,
        high_52w: priceData.high52w,
        low_52w: priceData.low52w
    }))

    try {
        const { error } = await supabase
            .from('stock_prices')
            .insert(rows)

        if (!error) {
            return
        }

        console.error('Error saving stock price batch:', error)
    } catch (error) {
        console.error('Error saving stock price batch:', error)
    }

    await Promise.all(priceDataList.map((priceData) => saveStockPrice(priceData)))
}
