import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchStockPriceFromYahoo, saveStockPrice } from '@/lib/stock-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * 从数据库获取缓存的股价
 */
async function getCachedStockPrice(symbol: string) {
  try {
    const { data, error } = await supabase
      .from('stock_prices')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
    }

    return data
  } catch (error) {
    console.error('Error getting cached price:', error)
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const normalizedSymbol = symbol.toUpperCase()

    // 1. 首先尝试从 Yahoo Finance 获取最新数据
    const freshData = await fetchStockPriceFromYahoo(normalizedSymbol)

    if (freshData) {
      // 异步保存到数据库
      saveStockPrice(freshData)

      return NextResponse.json({
        symbol: normalizedSymbol,
        price: freshData.price,
        change: freshData.change,
        changePercent: freshData.changePercent,
        volume: freshData.volume,
        marketCap: freshData.marketCap,
        peRatio: freshData.peRatio,
        high52w: freshData.high52w,
        low52w: freshData.low52w,
        timestamp: freshData.timestamp,
        source: 'yahoo_finance',
        cached: false
      })
    }

    // 2. 如果获取失败，尝试从数据库获取缓存数据
    const cachedData = await getCachedStockPrice(normalizedSymbol)

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
        source: 'database',
        cached: true
      })
    }

    // 3. 如果都没有数据，返回 404
    return NextResponse.json(
      { error: 'Stock price data not found' },
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
