import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applySessionCookies, resolveSessionFromRequest } from '@/lib/auth/session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const userIdNum = resolvedSession.appUser.id
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: history, error } = await supabase
      .from('portfolio_history')
      .select('*')
      .eq('user_id', userIdNum)
      .gte('record_date', startDate.toISOString().split('T')[0])
      .order('record_date', { ascending: true })

    if (error) {
      console.error('Error fetching portfolio history:', error)
      return respond({ error: '获取历史记录失败' }, 500)
    }

    const chartData = (history || []).map(item => ({
      date: item.record_date,
      value: Number(item.total_value),
      gain: Number(item.total_gain),
      gainPct: Number(item.total_gain_pct)
    }))

    return respond({
      history: chartData,
      summary: {
        period: days,
        dataPoints: chartData.length,
        startValue: chartData.length > 0 ? chartData[0].value : 0,
        endValue: chartData.length > 0 ? chartData[chartData.length - 1].value : 0,
        change: chartData.length > 1 
          ? chartData[chartData.length - 1].value - chartData[0].value 
          : 0,
        changePct: chartData.length > 1 && chartData[0].value > 0
          ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
          : 0
      }
    })

  } catch (error) {
    console.error('Portfolio history API error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const { data: positions, error: positionsError } = await supabase
      .from('user_portfolios')
      .select('symbol, shares, avg_cost_basis')
      .eq('user_id', userIdNum)

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return respond({ error: '获取持仓失败' }, 500)
    }

    if (!positions || positions.length === 0) {
      return respond({ error: '暂无持仓' }, 400)
    }

    const symbols = positions.map(p => p.symbol)

    const { data: prices } = await supabase
      .from('stock_prices')
      .select('symbol, price')
      .in('symbol', symbols)
      .order('timestamp', { ascending: false })
      .limit(symbols.length)

    const priceMap = new Map()
    if (prices) {
      prices.forEach(p => {
        if (!priceMap.has(p.symbol)) {
          priceMap.set(p.symbol, p.price)
        }
      })
    }

    let totalValue = 0
    let totalCost = 0
    const positionsSnapshot = positions.map(p => {
      const currentPrice = priceMap.get(p.symbol) || 0
      const value = currentPrice * p.shares
      const cost = p.avg_cost_basis * p.shares
      totalValue += value
      totalCost += cost
      return {
        symbol: p.symbol,
        shares: p.shares,
        avgCost: p.avg_cost_basis,
        currentPrice,
        value,
        cost,
        gain: value - cost
      }
    })

    const totalGain = totalValue - totalCost
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
    const today = new Date().toISOString().split('T')[0]

    const { error: upsertError } = await supabase
      .from('portfolio_history')
      .upsert({
        user_id: userIdNum,
        record_date: today,
        total_value: totalValue,
        total_cost: totalCost,
        total_gain: totalGain,
        total_gain_pct: totalGainPct,
        position_count: positions.length,
        positions_snapshot: positionsSnapshot
      }, {
        onConflict: 'user_id,record_date'
      })

    if (upsertError) {
      console.error('Error saving history:', upsertError)
      return respond({ error: '保存历史记录失败' }, 500)
    }

    return respond({
      success: true,
      message: '历史记录已保存',
      data: {
        total_value: totalValue,
        total_cost: totalCost,
        total_gain: totalGain,
        total_gain_pct: totalGainPct,
        position_count: positions.length
      }
    })

  } catch (error) {
    console.error('Portfolio history POST error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
