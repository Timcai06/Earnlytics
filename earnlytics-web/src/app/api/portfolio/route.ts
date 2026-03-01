import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applySessionCookies, resolveSessionFromRequest } from '@/lib/auth/session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const PRICE_EXPIRY_MINUTES = 15

async function fetchAndUpdateStockPrice(symbol: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock-price/${symbol}`)
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
  }
  return null
}

function isPriceStale(timestamp: string | null): boolean {
  if (!timestamp) return true
  const priceTime = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - priceTime.getTime()
  const diffMinutes = diffMs / (1000 * 60)
  return diffMinutes > PRICE_EXPIRY_MINUTES
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
    const userIdNum = resolvedSession.appUser.id
    const respond = (payload: unknown, status = 200) => {
      const response = NextResponse.json(payload, { status })
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session)
      }
      return response
    }

    const { data: positions, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userIdNum)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching portfolio:', error)
      return respond({ error: '获取持仓失败' }, 500)
    }

    if (!positions || positions.length === 0) {
      return respond({
        positions: [],
        summary: {
          total_value: 0,
          total_cost: 0,
          total_gain: 0,
          total_gain_pct: 0,
          position_count: 0
        }
      })
    }

    const symbols = positions.map(p => p.symbol)

    const { data: prices } = await supabase
      .from('stock_prices')
      .select('symbol, price, change, change_percent, timestamp')
      .in('symbol', symbols)
      .order('timestamp', { ascending: false })
      .limit(symbols.length)

    const priceMap = new Map()
    const staleSymbols: string[] = []
    
    if (prices) {
      prices.forEach(p => {
        if (!priceMap.has(p.symbol)) {
          priceMap.set(p.symbol, p)
          if (isPriceStale(p.timestamp)) {
            staleSymbols.push(p.symbol)
          }
        }
      })
    }

    if (staleSymbols.length > 0) {
      console.log(`Refreshing ${staleSymbols.length} stale prices:`, staleSymbols)
      
      await Promise.all(staleSymbols.map(async (symbol) => {
        const freshData = await fetchAndUpdateStockPrice(symbol)
        if (freshData) {
          const priceEntry = priceMap.get(symbol)
          if (priceEntry) {
            priceEntry.price = freshData.price
            priceEntry.change = freshData.change
            priceEntry.change_percent = freshData.changePercent
            priceEntry.timestamp = freshData.timestamp
          }
        }
      }))
    }

    const { data: companies } = await supabase
      .from('companies')
      .select('symbol, name, logo_url')
      .in('symbol', symbols)

    const companyMap = new Map()
    if (companies) {
      companies.forEach(c => companyMap.set(c.symbol, c))
    }

    const positionsWithData = positions.map(pos => {
      const priceData = priceMap.get(pos.symbol)
      const companyData = companyMap.get(pos.symbol)
      const currentPrice = priceData?.price || 0
      const currentValue = currentPrice * pos.shares
      const totalCost = pos.avg_cost_basis * pos.shares
      const gain = currentValue - totalCost
      const gainPct = totalCost > 0 ? (gain / totalCost) * 100 : 0

      return {
        id: pos.id,
        symbol: pos.symbol,
        company_name: companyData?.name || pos.symbol,
        logo_url: companyData?.logo_url || null,
        shares: pos.shares,
        avg_cost_basis: pos.avg_cost_basis,
        current_price: currentPrice,
        current_value: currentValue,
        total_cost: totalCost,
        gain: gain,
        gain_pct: gainPct,
        price_change: priceData?.change || 0,
        price_change_pct: priceData?.change_percent || 0,
        price_timestamp: priceData?.timestamp || null,
        is_stale: isPriceStale(priceData?.timestamp)
      }
    })

    const totalValue = positionsWithData.reduce((sum, p) => sum + p.current_value, 0)
    const totalCost = positionsWithData.reduce((sum, p) => sum + p.total_cost, 0)
    const totalGain = totalValue - totalCost
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

    return respond({
      positions: positionsWithData,
      metadata: {
        last_updated: new Date().toISOString(),
        price_expiry_minutes: PRICE_EXPIRY_MINUTES,
        stale_positions: positionsWithData.filter(p => p.is_stale).length
      },
      summary: {
        total_value: totalValue,
        total_cost: totalCost,
        total_gain: totalGain,
        total_gain_pct: totalGainPct,
        position_count: positionsWithData.length
      }
    })

  } catch (error) {
    console.error('Portfolio API error:', error)
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

    const userIdNum = resolvedSession.appUser.id
    const respond = (payload: unknown, status = 200) => {
      const response = NextResponse.json(payload, { status })
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session)
      }
      return response
    }

    const body = await request.json()
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim().toUpperCase() : ''
    const shares = Number(body.shares)
    const costBasis = Number(body.cost_basis)

    if (!symbol || !Number.isFinite(shares) || !Number.isFinite(costBasis) || shares <= 0 || costBasis <= 0) {
      return respond({ error: '缺少必要参数' }, 400)
    }

    const { data: existing, error: existingError } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userIdNum)
      .eq('symbol', symbol)
      .maybeSingle()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing position:', existingError)
    }

    if (existing) {
      const newShares = existing.shares + shares
      const newCostBasis = ((existing.avg_cost_basis * existing.shares) + (costBasis * shares)) / newShares

      const { error: updateError } = await supabase
        .from('user_portfolios')
        .update({
          shares: newShares,
          avg_cost_basis: newCostBasis,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating position:', updateError)
        return respond({ error: '更新持仓失败' }, 500)
      }

      const { error: transactionError } = await supabase
        .from('user_transactions')
        .insert({
          user_id: userIdNum,
          symbol,
          transaction_type: 'buy',
          shares,
          price_per_share: costBasis,
          transaction_date: new Date().toISOString().split('T')[0]
        })

      if (transactionError) {
        console.error('Error logging transaction:', transactionError)
      }

      return respond({
        success: true,
        message: '持仓已更新'
      })
    }

    const { error: insertError } = await supabase
      .from('user_portfolios')
      .insert({
        user_id: userIdNum,
        symbol,
        shares,
        avg_cost_basis: costBasis
      })

    if (insertError) {
      console.error('Error inserting position:', insertError)
      return respond({ error: '添加持仓失败' }, 500)
    }

    const { error: transactionError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: userIdNum,
        symbol,
        transaction_type: 'buy',
        shares,
        price_per_share: costBasis,
        transaction_date: new Date().toISOString().split('T')[0]
      })

    if (transactionError) {
      console.error('Error logging transaction:', transactionError)
    }

    return respond({
      success: true,
      message: '持仓已添加'
    })

  } catch (error) {
    console.error('Portfolio POST error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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
    const positionId = searchParams.get('id')

    if (!positionId) {
      return respond({ error: '缺少必要参数' }, 400)
    }

    const { error: deleteError } = await supabase
      .from('user_portfolios')
      .delete()
      .eq('id', parseInt(positionId))
      .eq('user_id', resolvedSession.appUser.id)

    if (deleteError) {
      console.error('Error deleting position:', deleteError)
      return respond({ error: '删除持仓失败' }, 500)
    }

    return respond({
      success: true,
      message: '持仓已删除'
    })

  } catch (error) {
    console.error('Portfolio DELETE error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
