import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applySessionCookies, resolveSessionFromRequest } from '@/lib/auth/session'
import {
  getLatestStockPrices,
  isStockPriceStale,
  refreshStockPricesBatch,
} from '@/lib/stock-price-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const PRICE_EXPIRY_MINUTES = 15
const DEFAULT_HISTORY_DAYS = 30

interface PositionRow {
  id: number
  symbol: string
  shares: number
  avg_cost_basis: number
}

interface CompanyRow {
  id: number
  symbol: string
  name: string
  logo_url: string | null
}

interface EarningsRow {
  id: number
  company_id: number
  fiscal_year: number
  fiscal_quarter: number
  report_date: string
  ai_analyses?: { summary: string | null; sentiment: string | null }[] | null
}

interface HistoryRow {
  record_date: string
  total_value: number | string
  total_gain: number | string
  total_gain_pct: number | string
}

function parseHistoryDays(raw: string | null): number {
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_HISTORY_DAYS
  if (!Number.isFinite(parsed)) return DEFAULT_HISTORY_DAYS
  return Math.min(Math.max(parsed, 7), 365)
}

function pickFirstAnalysis(analyses: EarningsRow['ai_analyses']) {
  if (!analyses || analyses.length === 0) return null
  return analyses[0]
}

export async function GET(request: Request) {
  try {
    const resolvedSession = await resolveSessionFromRequest(request)
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 })
    }
    if (!resolvedSession.appUser) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }

    const respond = (payload: unknown, status = 200) => {
      const response = NextResponse.json(payload, { status })
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session)
      }
      return response
    }

    const userIdNum = resolvedSession.appUser.id
    const { searchParams } = new URL(request.url)
    const historyDays = parseHistoryDays(searchParams.get('days'))

    const { data: positions, error: positionsError } = await supabase
      .from('user_portfolios')
      .select('id, symbol, shares, avg_cost_basis')
      .eq('user_id', userIdNum)
      .order('created_at', { ascending: false })

    if (positionsError) {
      console.error('Error fetching portfolio overview positions:', positionsError)
      return respond({ error: '获取持仓失败' }, 500)
    }

    const today = new Date().toISOString().split('T')[0]
    const historyStartDate = new Date()
    historyStartDate.setDate(historyStartDate.getDate() - historyDays)

    const { data: historyRows, error: historyError } = await supabase
      .from('portfolio_history')
      .select('record_date, total_value, total_gain, total_gain_pct')
      .eq('user_id', userIdNum)
      .gte('record_date', historyStartDate.toISOString().split('T')[0])
      .order('record_date', { ascending: true })

    if (historyError) {
      console.error('Error fetching portfolio overview history:', historyError)
    }

    const historyPoints = ((historyRows || []) as HistoryRow[]).map((item) => ({
      date: item.record_date,
      value: Number(item.total_value),
      gain: Number(item.total_gain),
      gainPct: Number(item.total_gain_pct),
    }))

    const historySummary = {
      startValue: historyPoints.length > 0 ? historyPoints[0].value : 0,
      endValue: historyPoints.length > 0 ? historyPoints[historyPoints.length - 1].value : 0,
      change: historyPoints.length > 1 ? historyPoints[historyPoints.length - 1].value - historyPoints[0].value : 0,
      changePct:
        historyPoints.length > 1 && historyPoints[0].value > 0
          ? ((historyPoints[historyPoints.length - 1].value - historyPoints[0].value) / historyPoints[0].value) * 100
          : 0,
    }

    const { data: briefingRow, error: briefingError } = await supabase
      .from('portfolio_briefings')
      .select('content, sentiment, highlights, concerns, created_at')
      .eq('user_id', userIdNum)
      .eq('record_date', today)
      .maybeSingle()

    if (briefingError) {
      console.error('Error fetching portfolio overview briefing:', briefingError)
    }

    if (!positions || positions.length === 0) {
      return respond({
        positions: [],
        summary: {
          total_value: 0,
          total_cost: 0,
          total_gain: 0,
          total_gain_pct: 0,
          position_count: 0,
        },
        earnings: {
          upcoming: [],
          recent: [],
        },
        history: {
          rangeDays: historyDays,
          points: historyPoints,
          summary: historySummary,
        },
        briefing: briefingRow
          ? {
              content: briefingRow.content,
              sentiment: briefingRow.sentiment,
              highlights: briefingRow.highlights || [],
              concerns: briefingRow.concerns || [],
              createdAt: briefingRow.created_at,
            }
          : null,
        metadata: {
          lastUpdated: new Date().toISOString(),
          stalePositions: 0,
          priceExpiryMinutes: PRICE_EXPIRY_MINUTES,
        },
      })
    }

    const positionRows = positions as PositionRow[]
    const symbols = positionRows.map((position) => position.symbol)
    const uniqueSymbols = [...new Set(symbols.map((symbol) => symbol.toUpperCase()))]

    const priceMap = await getLatestStockPrices(uniqueSymbols)
    const staleSymbols = uniqueSymbols.filter((symbol) => {
      const row = priceMap.get(symbol)
      return !row || isStockPriceStale(row.timestamp, PRICE_EXPIRY_MINUTES * 60 * 1000)
    })

    if (staleSymbols.length > 0) {
      const freshMap = await refreshStockPricesBatch(staleSymbols)
      freshMap.forEach((value, key) => {
        priceMap.set(key, value)
      })
    }

    const { data: companyRows, error: companiesError } = await supabase
      .from('companies')
      .select('id, symbol, name, logo_url')
      .in('symbol', uniqueSymbols)

    if (companiesError) {
      console.error('Error fetching portfolio overview companies:', companiesError)
      return respond({ error: '获取公司信息失败' }, 500)
    }

    const companyBySymbol = new Map<string, CompanyRow>()
    const companyById = new Map<number, CompanyRow>()
    ;((companyRows || []) as CompanyRow[]).forEach((company) => {
      const upperSymbol = company.symbol.toUpperCase()
      companyBySymbol.set(upperSymbol, company)
      companyById.set(company.id, { ...company, symbol: upperSymbol })
    })

    const positionsWithData = positionRows.map((position) => {
      const normalizedSymbol = position.symbol.toUpperCase()
      const priceData = priceMap.get(normalizedSymbol)
      const companyData = companyBySymbol.get(normalizedSymbol)
      const currentPrice = priceData?.price || 0
      const currentValue = currentPrice * position.shares
      const totalCost = position.avg_cost_basis * position.shares
      const gain = currentValue - totalCost
      const gainPct = totalCost > 0 ? (gain / totalCost) * 100 : 0

      return {
        id: position.id,
        symbol: normalizedSymbol,
        company_name: companyData?.name || normalizedSymbol,
        logo_url: companyData?.logo_url || null,
        shares: position.shares,
        avg_cost_basis: position.avg_cost_basis,
        current_price: currentPrice,
        current_value: currentValue,
        total_cost: totalCost,
        gain,
        gain_pct: gainPct,
        price_change: priceData?.change || 0,
        price_change_pct: priceData?.change_percent || 0,
        price_timestamp: priceData?.timestamp || null,
        is_stale: isStockPriceStale(priceData?.timestamp || null, PRICE_EXPIRY_MINUTES * 60 * 1000),
      }
    })

    const totalValue = positionsWithData.reduce((sum, position) => sum + position.current_value, 0)
    const totalCost = positionsWithData.reduce((sum, position) => sum + position.total_cost, 0)
    const totalGain = totalValue - totalCost
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

    const companyIds = Array.from(companyById.keys())
    let upcomingRows: EarningsRow[] = []
    let recentRows: EarningsRow[] = []

    if (companyIds.length > 0) {
      const [{ data: upcomingData }, { data: recentData }] = await Promise.all([
        supabase
          .from('earnings')
          .select('id, company_id, fiscal_year, fiscal_quarter, report_date')
          .in('company_id', companyIds)
          .gte('report_date', today)
          .order('report_date', { ascending: true })
          .limit(10),
        supabase
          .from('earnings')
          .select('id, company_id, fiscal_year, fiscal_quarter, report_date, ai_analyses (summary, sentiment)')
          .in('company_id', companyIds)
          .lt('report_date', today)
          .order('report_date', { ascending: false })
          .limit(10),
      ])

      upcomingRows = (upcomingData || []) as EarningsRow[]
      recentRows = (recentData || []) as EarningsRow[]
    }

    const upcoming = upcomingRows
      .map((row) => {
        const company = companyById.get(row.company_id)
        if (!company) return null
        return {
          symbol: company.symbol,
          company_name: company.name,
          logo_url: company.logo_url,
          report_date: row.report_date,
          fiscal_quarter: `Q${row.fiscal_quarter} ${row.fiscal_year}`,
          days_until: Math.ceil((new Date(row.report_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    const recent = recentRows
      .map((row) => {
        const company = companyById.get(row.company_id)
        if (!company) return null
        const analysis = pickFirstAnalysis(row.ai_analyses)
        return {
          symbol: company.symbol,
          company_name: company.name,
          logo_url: company.logo_url,
          report_date: row.report_date,
          fiscal_quarter: `Q${row.fiscal_quarter} ${row.fiscal_year}`,
          ai_sentiment: analysis?.sentiment || 'neutral',
          ai_summary: analysis?.summary || '',
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return respond({
      positions: positionsWithData,
      summary: {
        total_value: totalValue,
        total_cost: totalCost,
        total_gain: totalGain,
        total_gain_pct: totalGainPct,
        position_count: positionsWithData.length,
      },
      earnings: {
        upcoming,
        recent,
      },
      history: {
        rangeDays: historyDays,
        points: historyPoints,
        summary: historySummary,
      },
      briefing: briefingRow
        ? {
            content: briefingRow.content,
            sentiment: briefingRow.sentiment,
            highlights: briefingRow.highlights || [],
            concerns: briefingRow.concerns || [],
            createdAt: briefingRow.created_at,
          }
        : null,
      metadata: {
        lastUpdated: new Date().toISOString(),
        stalePositions: positionsWithData.filter((position) => position.is_stale).length,
        priceExpiryMinutes: PRICE_EXPIRY_MINUTES,
      },
    })
  } catch (error) {
    console.error('Portfolio overview API error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
