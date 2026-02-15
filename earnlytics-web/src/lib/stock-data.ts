import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

/**
 * Fetch real stock price from Yahoo Finance
 */
export async function fetchStockPriceFromYahoo(symbol: string): Promise<StockData | null> {
    try {
        // Use quote endpoint which is more reliable for current price snapshots
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`

        // Random user agent to avoid blocking
        const userAgents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        ]
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent
            },
            next: { revalidate: 60 }
        })

        if (!response.ok) {
            console.warn(`Yahoo API returned ${response.status} for ${symbol}`)
            return null
        }

        const data = await response.json()
        const result = data.quoteResponse?.result?.[0]

        if (!result) return null

        return {
            symbol: symbol.toUpperCase(),
            price: result.regularMarketPrice || 0,
            change: result.regularMarketChange || 0,
            changePercent: result.regularMarketChangePercent || 0,
            volume: result.regularMarketVolume || 0,
            marketCap: result.marketCap || null,
            peRatio: result.trailingPE || null,
            high52w: result.fiftyTwoWeekHigh || null,
            low52w: result.fiftyTwoWeekLow || null,
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error)
        return null
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
