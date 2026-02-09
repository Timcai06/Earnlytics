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
      if (latest === 'true') {
        const result = await supabase
          .from('earnings')
          .select(`
            *,
            companies (*),
            ai_analyses (*)
          `)
          .eq('companies.symbol', symbol)
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
          .eq('companies.symbol', symbol)
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
        { error: 'Failed to fetch earnings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ earnings: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
