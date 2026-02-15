import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // 月份最后一天

  const { data: earnings, error } = await supabase
    .from('earnings')
    .select(`
      id,
      report_date,
      fiscal_year,
      fiscal_quarter,
      companies (
        symbol,
        name
      )
    `)
    .gte('report_date', startDate.toISOString().split('T')[0])
    .lte('report_date', endDate.toISOString().split('T')[0])
    .order('report_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 格式化返回数据
  const events = earnings?.map(e => ({
    id: e.id,
    date: e.report_date,
    symbol: (e.companies as { symbol?: string })?.symbol,
    companyName: (e.companies as { name?: string })?.name,
    fiscalYear: e.fiscal_year,
    fiscalQuarter: e.fiscal_quarter,
  })) || []

  return NextResponse.json({
    year,
    month,
    events,
    total: events.length,
  })
}
