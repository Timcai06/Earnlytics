import { NextResponse } from 'next/server'
import { fetchCalendarEvents } from '@/app/calendar/calendar-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

  try {
    const events = await fetchCalendarEvents(year, month)
    return NextResponse.json({
      year,
      month,
      events,
      total: events.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
