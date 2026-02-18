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

    const { data: positions, error: positionsError } = await supabase
      .from('user_portfolios')
      .select('symbol')
      .eq('user_id', userIdNum)

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return NextResponse.json(
        { error: '获取持仓失败' },
        { status: 500 }
      )
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json({
        upcoming: [],
        recent: []
      })
    }

    const symbols = positions.map(p => p.symbol)
    const today = new Date().toISOString().split('T')[0]

    const { data: upcomingEarnings } = await supabase
      .from('earnings')
      .select(`
        id,
        company_id,
        fiscal_year,
        fiscal_quarter,
        report_date,
        companies (symbol, name, logo_url)
      `)
      .in('companies.symbol', symbols)
      .gte('report_date', today)
      .order('report_date', { ascending: true })
      .limit(10)

    const { data: recentEarnings } = await supabase
      .from('earnings')
      .select(`
        id,
        company_id,
        fiscal_year,
        fiscal_quarter,
        report_date,
        companies (symbol, name, logo_url),
        ai_analyses (summary, sentiment)
      `)
      .in('companies.symbol', symbols)
      .lt('report_date', today)
      .order('report_date', { ascending: false })
      .limit(10)

    const upcoming = (upcomingEarnings || []).map((e: any) => ({
      symbol: e.companies?.symbol,
      company_name: e.companies?.name,
      logo_url: e.companies?.logo_url,
      report_date: e.report_date,
      fiscal_quarter: `Q${e.fiscal_quarter} ${e.fiscal_year}`,
      days_until: Math.ceil((new Date(e.report_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))

    const recent = (recentEarnings || []).map((e: any) => ({
      symbol: e.companies?.symbol,
      company_name: e.companies?.name,
      logo_url: e.companies?.logo_url,
      report_date: e.report_date,
      fiscal_quarter: `Q${e.fiscal_quarter} ${e.fiscal_year}`,
      ai_sentiment: e.ai_analyses?.[0]?.sentiment || 'neutral',
      ai_summary: e.ai_analyses?.[0]?.summary || ''
    }))

    return NextResponse.json({
      upcoming,
      recent
    })

  } catch (error) {
    console.error('Portfolio earnings API error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
