import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { id } = await params
    const earningsId = parseInt(id)

    if (isNaN(earningsId)) {
      return NextResponse.json(
        { error: 'Invalid earnings ID' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('earnings')
      .select(`
        *,
        companies (*),
        ai_analyses (*)
      `)
      .eq('id', earningsId)
      .single()

    if (error) {
      console.error('Error fetching earnings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch earnings', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Earnings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ earnings: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}
