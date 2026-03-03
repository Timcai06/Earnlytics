import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import {
    getLatestStockPrices,
    isStockPriceStale,
} from '@/lib/stock-price-service'

// Symbols to show in the ticker
const TICKER_SYMBOLS = [
    'AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'META', 'AMZN', 'AMD', 'INTC', 'NFLX'
]

interface TickerPriceItem {
    symbol: string
    price: number
    change: number | null
    change_percent?: number | null
    timestamp: string
}

interface CachedTickerResponse {
    expiresAt: number
    payload: string
    etag: string
}

const CACHE_CONTROL = 'public, max-age=30, s-maxage=300, stale-while-revalidate=600'
const MEMORY_TTL_MS = 30 * 1000
let cachedResponse: CachedTickerResponse | null = null

function buildEtag(payload: string) {
    const digest = createHash('sha1').update(payload).digest('base64url')
    return `W/"${digest}"`
}

function buildHeaders(etag: string): HeadersInit {
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': CACHE_CONTROL,
        ETag: etag,
    }
}

function etagMatches(ifNoneMatch: string | null, etag: string) {
    if (!ifNoneMatch) return false
    return ifNoneMatch
        .split(',')
        .map((value) => value.trim())
        .some((value) => value === etag || value === '*')
}

export async function GET(request: Request) {
    try {
        const ifNoneMatch = request.headers.get('if-none-match')
        const now = Date.now()

        if (cachedResponse && cachedResponse.expiresAt > now) {
            if (etagMatches(ifNoneMatch, cachedResponse.etag)) {
                return new NextResponse(null, {
                    status: 304,
                    headers: buildHeaders(cachedResponse.etag),
                })
            }
            return new NextResponse(cachedResponse.payload, {
                status: 200,
                headers: buildHeaders(cachedResponse.etag),
            })
        }

        const latestPriceMap = await getLatestStockPrices(TICKER_SYMBOLS)
        const priceMap = new Map<string, TickerPriceItem>()
        latestPriceMap.forEach((item, symbol) => {
            priceMap.set(symbol, {
                symbol,
                price: item.price,
                change: item.change,
                change_percent: item.change_percent,
                timestamp: item.timestamp,
            })
        })

        // 2. Identify missing or stale symbols (older than 15 minutes)
        const missingSymbols = TICKER_SYMBOLS.filter(symbol => {
            const item = priceMap.get(symbol)
            if (!item) return true
            const isStale = isStockPriceStale(item.timestamp)
            const hasNoChangeData = item.change_percent === 0 && item.change === 0
            return isStale || hasNoChangeData
        })

        if (missingSymbols.length > 0) {
            console.log(`Ticker symbols currently stale/missing: ${missingSymbols.join(', ')}`)
        }

        // 4. Format results
        const results = TICKER_SYMBOLS.map(symbol => {
            const data = priceMap.get(symbol)
            if (!data) return null
            return {
                symbol: data.symbol,
                price: data.price,
                change: data.change ?? 0,
                changePercent: data.change_percent ?? 0,
                isPositive: (data.change_percent ?? 0) >= 0,
            }
        }).filter(Boolean)

        const payload = JSON.stringify(results)
        const etag = buildEtag(payload)
        cachedResponse = {
            payload,
            etag,
            expiresAt: Date.now() + MEMORY_TTL_MS,
        }

        if (etagMatches(ifNoneMatch, etag)) {
            return new NextResponse(null, {
                status: 304,
                headers: buildHeaders(etag),
            })
        }

        return new NextResponse(payload, {
            status: 200,
            headers: buildHeaders(etag),
        })
    } catch (error) {
        console.error('Error in market-ticker API:', error)
        return NextResponse.json([], { status: 200 })
    }
}
