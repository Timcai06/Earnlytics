import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    const userIdNum = parseInt(userId)

    const { data: positions, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userIdNum)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching portfolio:', error)
      return NextResponse.json(
        { error: '获取持仓失败' },
        { status: 500 }
      )
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json({
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
      .select('symbol, price, change, change_percent')
      .in('symbol', symbols)
      .order('timestamp', { ascending: false })
      .limit(symbols.length)

    const priceMap = new Map()
    if (prices) {
      prices.forEach(p => {
        if (!priceMap.has(p.symbol)) {
          priceMap.set(p.symbol, p)
        }
      })
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
        price_change_pct: priceData?.change_percent || 0
      }
    })

    const totalValue = positionsWithData.reduce((sum, p) => sum + p.current_value, 0)
    const totalCost = positionsWithData.reduce((sum, p) => sum + p.total_cost, 0)
    const totalGain = totalValue - totalCost
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

    return NextResponse.json({
      positions: positionsWithData,
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
    const body = await request.json()
    const { user_id, symbol, shares, cost_basis } = body

    if (!user_id || !symbol || !shares || !cost_basis) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(user_id)

    const { data: existing, error: existingError } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userIdNum)
      .eq('symbol', symbol.toUpperCase())
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing position:', existingError)
    }

    if (existing) {
      const newShares = existing.shares + shares
      const newCostBasis = ((existing.avg_cost_basis * existing.shares) + (cost_basis * shares)) / newShares

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
        return NextResponse.json(
          { error: '更新持仓失败' },
          { status: 500 }
        )
      }

      const { error: transactionError } = await supabase
        .from('user_transactions')
        .insert({
          user_id: userIdNum,
          symbol: symbol.toUpperCase(),
          transaction_type: 'buy',
          shares: shares,
          price_per_share: cost_basis,
          transaction_date: new Date().toISOString().split('T')[0]
        })

      if (transactionError) {
        console.error('Error logging transaction:', transactionError)
      }

      return NextResponse.json({
        success: true,
        message: '持仓已更新'
      })
    }

    const { error: insertError } = await supabase
      .from('user_portfolios')
      .insert({
        user_id: userIdNum,
        symbol: symbol.toUpperCase(),
        shares: shares,
        avg_cost_basis: cost_basis
      })

    if (insertError) {
      console.error('Error inserting position:', insertError)
      return NextResponse.json(
        { error: '添加持仓失败' },
        { status: 500 }
      )
    }

    const { error: transactionError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: userIdNum,
        symbol: symbol.toUpperCase(),
        transaction_type: 'buy',
        shares: shares,
        price_per_share: cost_basis,
        transaction_date: new Date().toISOString().split('T')[0]
      })

    if (transactionError) {
      console.error('Error logging transaction:', transactionError)
    }

    return NextResponse.json({
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
    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!positionId || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('user_portfolios')
      .delete()
      .eq('id', parseInt(positionId))
      .eq('user_id', parseInt(userId))

    if (deleteError) {
      console.error('Error deleting position:', deleteError)
      return NextResponse.json(
        { error: '删除持仓失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
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
