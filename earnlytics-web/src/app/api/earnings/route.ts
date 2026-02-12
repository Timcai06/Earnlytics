import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const id = searchParams.get('id')
    const latest = searchParams.get('latest')

    let data: unknown
    let error: Error | null = null

    if (id) {
      const result = await supabase
        .from('earnings')
        .select(`
          *,
          companies (*),
          ai_analyses (*)
        `)
        .eq('id', id)
        .single()
      data = result.data
      error = result.error
    } else if (symbol) {
      // First get the company to find its ID (case-insensitive)
      const companyResult = await supabase
        .from('companies')
        .select('id')
        .ilike('symbol', symbol)
        .single()

      if (companyResult.error || !companyResult.data) {
        return NextResponse.json({ earnings: null })
      }

      const companyId = companyResult.data.id

      if (latest === 'true') {
        const result = await supabase
          .from('earnings')
          .select(`
            *,
            companies (*),
            ai_analyses (*)
          `)
          .eq('company_id', companyId)
          .lte('report_date', new Date().toISOString())
          .not('revenue', 'is', null)  // 只返回有实际数据的财报
          .order('report_date', { ascending: false })
          .limit(1)
          .single()
        data = result.data
        error = result.error
      } else {
        const result = await supabase
          .from('earnings')
          .select(`
            *,
            companies (*),
            ai_analyses (*)
          `)
          .eq('company_id', companyId)
          .not('revenue', 'is', null)  // 只返回有实际数据的财报
          .order('report_date', { ascending: false })
        data = result.data
        error = result.error
      }
    } else {
      const result = await supabase
        .from('earnings')
        .select(`
          *,
          companies (*),
          ai_analyses (*)
        `)
        .order('report_date', { ascending: false })
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error fetching earnings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch earnings', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ earnings: null })
    }

    return NextResponse.json({ earnings: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Internal server error', message: err.message, stack: err.stack },
      { status: 500 }
    )
  }
}
