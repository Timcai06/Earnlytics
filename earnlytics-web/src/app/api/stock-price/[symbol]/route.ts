import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * 从 Yahoo Finance 获取实时股价
 */
async function fetchStockPriceFromYahoo(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result || !result.meta) {
      throw new Error('No data found')
    }

    const meta = result.meta
    const regularMarketPrice = meta.regularMarketPrice
    const previousClose = meta.previousClose
    
    if (!regularMarketPrice) {
      throw new Error('No price data available')
    }

    const change = previousClose ? regularMarketPrice - previousClose : 0
    const changePercent = previousClose ? (change / previousClose) * 100 : 0

    return {
      symbol: symbol.toUpperCase(),
      price: regularMarketPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || null,
      peRatio: meta.trailingPE || null,
      high52w: meta.fiftyTwoWeekHigh || null,
      low52w: meta.fiftyTwoWeekLow || null,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error)
    return null
  }
}

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

/**
 * 保存股价到数据库
 */
async function saveStockPrice(priceData: {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number | null
  peRatio: number | null
  high52w: number | null
  low52w: number | null
}) {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const normalizedSymbol = symbol.toUpperCase()

    // 首先尝试从 Yahoo Finance 获取最新数据
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

    // 如果获取失败，尝试从数据库获取缓存数据
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

    // 如果都没有数据，返回 404
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
