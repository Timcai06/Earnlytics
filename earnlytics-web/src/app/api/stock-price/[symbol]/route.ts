import { NextResponse } from 'next/server'
import {
  getLatestStockPrice,
  isStockPriceStale,
  refreshStockPrice,
} from '@/lib/stock-price-service'

interface MockStockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  high52w: number
  low52w: number
  timestamp?: string
}

/**
 * Fallback: Get mock/demo data for demonstration
 */
function getMockStockData(symbol: string) {
  // Demo data for common stocks
  const mockData: Record<string, MockStockData> = {
    'PLTR': {
      symbol: 'PLTR',
      price: 79.50,
      change: 1.20,
      changePercent: 1.53,
      volume: 45000000,
      marketCap: 175000000000,
      peRatio: 185.50,
      high52w: 84.80,
      low52w: 16.50
    },
    'AAPL': {
      symbol: 'AAPL',
      price: 229.87,
      change: 1.45,
      changePercent: 0.63,
      volume: 52000000,
      marketCap: 3480000000000,
      peRatio: 35.20,
      high52w: 237.49,
      low52w: 164.08
    },
    'MSFT': {
      symbol: 'MSFT',
      price: 437.56,
      change: -2.34,
      changePercent: -0.53,
      volume: 22000000,
      marketCap: 3250000000000,
      peRatio: 36.80,
      high52w: 468.35,
      low52w: 362.90
    }
  }
  
  const data = mockData[symbol.toUpperCase()]
  if (!data) return null
  
  return {
    ...data,
    timestamp: new Date().toISOString()
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const normalizedSymbol = symbol.toUpperCase()

    // 1. 先尝试使用未过期缓存，避免每次请求都触发外部 API
    const cachedData = await getLatestStockPrice(normalizedSymbol)
    if (cachedData && !isStockPriceStale(cachedData.timestamp)) {
      return NextResponse.json({
        symbol: cachedData.symbol,
        price: cachedData.price,
        change: cachedData.change,
        changePercent: cachedData.change_percent,
        volume: cachedData.volume,
        marketCap: cachedData.market_cap,
        peRatio: cachedData.pe_ratio,
        high52w: cachedData.high_52w,
        low52w: cachedData.low_52w,
        timestamp: cachedData.timestamp,
        source: 'cache',
        cached: true
      })
    }

    // 2. 缓存过期或缺失时再尝试刷新实时数据
    const freshData = await refreshStockPrice(normalizedSymbol)
    if (freshData) {
      return NextResponse.json({
        symbol: normalizedSymbol,
        price: freshData.price,
        change: freshData.change,
        changePercent: freshData.change_percent,
        volume: freshData.volume,
        marketCap: freshData.market_cap,
        peRatio: freshData.pe_ratio,
        high52w: freshData.high_52w,
        low52w: freshData.low_52w,
        timestamp: freshData.timestamp,
        source: 'live',
        cached: false
      })
    }

    // 3. 实时刷新失败时使用旧缓存兜底
    if (cachedData) {
      return NextResponse.json({
        symbol: cachedData.symbol,
        price: cachedData.price,
        change: cachedData.change,
        changePercent: cachedData.change_percent,
        volume: cachedData.volume,
        marketCap: cachedData.market_cap,
        peRatio: cachedData.pe_ratio,
        high52w: cachedData.high_52w,
        low52w: cachedData.low_52w,
        timestamp: cachedData.timestamp,
        source: 'cache',
        cached: true
      })
    }

    // 4. 开发环境允许显式开启 mock 数据回退
    const allowMockFallback =
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_STOCK_MOCK_DATA === 'true'
    const mockData = allowMockFallback ? getMockStockData(normalizedSymbol) : null

    if (mockData && mockData.timestamp) {
      console.warn(`Using mock data for ${normalizedSymbol}`)
      return NextResponse.json({
        symbol: mockData.symbol,
        price: mockData.price,
        change: mockData.change,
        changePercent: mockData.changePercent,
        volume: mockData.volume,
        marketCap: mockData.marketCap,
        peRatio: mockData.peRatio,
        high52w: mockData.high52w,
        low52w: mockData.low52w,
        timestamp: mockData.timestamp,
        source: 'cache',
        cached: false
      })
    }

    // 5. 如果都没有数据，返回 unavailable
    return NextResponse.json(
      { error: 'Stock price data not found', source: 'unavailable', cached: false },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error in stock price API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
