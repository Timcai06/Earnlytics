import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applySessionCookies, resolveSessionFromRequest } from '@/lib/auth/session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface CompanyRelation {
  symbol: string
  name: string
  logo_url: string | null
}

interface AnalysisRelation {
  summary: string | null
  sentiment: string | null
}

interface EarningRow {
  id: number
  company_id: number
  fiscal_year: number
  fiscal_quarter: number
  report_date: string
  companies: CompanyRelation | CompanyRelation[] | null
  ai_analyses?: AnalysisRelation[] | null
}

function pickCompany(companies: EarningRow["companies"]): CompanyRelation | null {
  if (!companies) return null
  return Array.isArray(companies) ? companies[0] ?? null : companies
}

function pickFirstAnalysis(analyses: AnalysisRelation[] | null | undefined): AnalysisRelation | null {
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

    const userIdNum = resolvedSession.appUser.id
    const respond = (payload: unknown, status = 200) => {
      const response = NextResponse.json(payload, { status })
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session)
      }
      return response
    }

    const { data: positions, error: positionsError } = await supabase
      .from('user_portfolios')
      .select('symbol')
      .eq('user_id', userIdNum)

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return respond({ error: '获取持仓失败' }, 500)
    }

    if (!positions || positions.length === 0) {
      return respond({
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

    const upcoming = ((upcomingEarnings || []) as EarningRow[]).map((e) => {
      const company = pickCompany(e.companies)
      return {
      symbol: company?.symbol,
      company_name: company?.name,
      logo_url: company?.logo_url,
      report_date: e.report_date,
      fiscal_quarter: `Q${e.fiscal_quarter} ${e.fiscal_year}`,
      days_until: Math.ceil((new Date(e.report_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }
    })

    const recent = ((recentEarnings || []) as EarningRow[]).map((e) => {
      const company = pickCompany(e.companies)
      const analysis = pickFirstAnalysis(e.ai_analyses)
      return {
      symbol: company?.symbol,
      company_name: company?.name,
      logo_url: company?.logo_url,
      report_date: e.report_date,
      fiscal_quarter: `Q${e.fiscal_quarter} ${e.fiscal_year}`,
      ai_sentiment: analysis?.sentiment || 'neutral',
      ai_summary: analysis?.summary || ''
      }
    })

    return respond({
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
