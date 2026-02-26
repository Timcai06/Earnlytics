import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchStockPriceFromYahoo, saveStockPrice } from '@/lib/stock-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Symbols to show in the ticker
const TICKER_SYMBOLS = [
    'AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'META', 'AMZN', 'AMD', 'INTC', 'NFLX'
]

interface TickerPriceItem {
    symbol: string
    price: number
    change: number
    change_percent?: number
    changePercent?: number
    timestamp: string
}

export async function GET() {
    try {
        // 1. Fetch cached data from DB
        const { data: cachedData } = await supabase
            .from('stock_prices')
            .select('symbol, price, change, change_percent, timestamp')
            .in('symbol', TICKER_SYMBOLS)
            .order('timestamp', { ascending: false })

        const priceMap = new Map<string, TickerPriceItem>()
        if (cachedData) {
            cachedData.forEach((item) => {
                if (!priceMap.has(item.symbol)) {
                    priceMap.set(item.symbol, {
                        symbol: item.symbol,
                        price: item.price,
                        change: item.change,
                        change_percent: item.change_percent ?? undefined,
                        timestamp: item.timestamp,
                    })
                }
            })
        }

        // 2. Identify missing or stale symbols (older than 15 minutes)
        const now = new Date().getTime()
        const missingSymbols = TICKER_SYMBOLS.filter(symbol => {
            const item = priceMap.get(symbol)
            if (!item) return true
            const lastUpdate = new Date(item.timestamp).getTime()
            const isStale = (now - lastUpdate) > 15 * 60 * 1000 // 15 minutes
            const hasNoChangeData = item.change_percent === 0 && item.change === 0
            return isStale || hasNoChangeData
        })

        // 3. Fetch missing data in parallel
        if (missingSymbols.length > 0) {
            console.log(`Fetching fresh data for: ${missingSymbols.join(', ')}`)
            const freshResults = await Promise.all(
                missingSymbols.map(async (symbol) => {
                    const data = await fetchStockPriceFromYahoo(symbol)
                    if (data) {
                        await saveStockPrice(data)
                        return data
                    }
                    return null
                })
            )

            freshResults.forEach(data => {
                if (data) {
                    priceMap.set(data.symbol, {
                        symbol: data.symbol,
                        price: data.price,
                        change: data.change,
                        change_percent: data.changePercent,
                        timestamp: data.timestamp
                    })
                }
            })
        }

        // 4. Format results
        const results = TICKER_SYMBOLS.map(symbol => {
            const data = priceMap.get(symbol)
            if (!data) return null
            return {
                symbol: data.symbol,
                price: data.price,
                change: data.change,
                changePercent: data.change_percent || data.changePercent, // handle both casing from DB vs API
                isPositive: (data.change_percent || data.changePercent || 0) >= 0,
            }
        }).filter(Boolean)

        return NextResponse.json(results, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        })
    } catch (error) {
        console.error('Error in market-ticker API:', error)
        return NextResponse.json([], { status: 200 })
    }
}
