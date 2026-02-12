"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import HorizontalGlow from "@/components/ui/horizontal-glow"

interface CalendarEvent {
  id: number
  date: string
  symbol: string
  companyName: string
  fiscalYear: number
  fiscalQuarter: number
}

const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

export default function CalendarClient({
  initialYear,
  initialMonth,
}: {
  initialYear: number
  initialMonth: number
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        const res = await fetch(`/api/calendar?year=${year}&month=${month}`)
        const data = await res.json()
        
        if (data.events) {
          const eventMap: Record<string, CalendarEvent[]> = {}
          data.events.forEach((e: CalendarEvent) => {
            const day = e.date.split("-")[2]
            if (!eventMap[day]) eventMap[day] = []
            eventMap[day].push(e)
          })
          setEvents(eventMap)
        }
      } catch (error) {
        console.error("Failed to fetch calendar events:", error)
      }
      setLoading(false)
    }

    fetchEvents()
  }, [year, month])

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(y => y - 1)
      setMonth(12)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(y => y + 1)
      setMonth(1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const goToToday = () => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
  }

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background px-6 py-16 md:px-20 md:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <HorizontalGlow />
            <h1 className="relative z-10 text-3xl font-bold text-white md:text-[40px]">
              财报日历
            </h1>
          </div>
          <p className="text-base text-[#A1A1AA] md:text-lg">
            追踪即将发布的科技公司财报
          </p>
        </div>
      </section>

      {/* Calendar Content */}
      <section className="bg-background px-6 pb-24 md:px-20">
        <div className="mx-auto max-w-6xl">
          {/* Calendar Grid */}
          <div className="rounded-2xl border border-[#6366F1] bg-surface-secondary p-4 shadow-[0_0_20px_rgba(99,102,241,0.13)] md:p-8">
            {/* Header */}
            <div className="mb-4 flex flex-col items-center justify-between gap-4 md:mb-6 md:flex-row">
              <h2 className="text-xl font-bold text-white md:text-2xl">
                {year}年{monthNames[month - 1]}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="rounded-lg px-3 py-2 text-sm text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
                >
                  ← 上月
                </button>
                <button
                  onClick={goToToday}
                  className="rounded-lg px-3 py-2 text-sm text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-colors"
                >
                  今天
                </button>
                <button
                  onClick={goToNextMonth}
                  className="rounded-lg px-3 py-2 text-sm text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
                >
                  下月 →
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="mb-4 hidden grid-cols-7 gap-2 md:grid">
              {weekDays.map((day) => (
                <div key={day} className="py-3 text-center text-sm font-semibold text-[#71717A]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before the first day of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] rounded-lg bg-transparent md:min-h-[120px]" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayStr = day.toString()
                  const dayEvents = events[dayStr] || []
                  const hasEvent = dayEvents.length > 0

                  return (
                    <div
                      key={day}
                      className={`min-h-[100px] rounded-lg p-2 md:min-h-[120px] md:p-3 ${
                        hasEvent
                          ? "border border-[#6366F1] bg-[rgba(99,102,241,0.15)] shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                          : "bg-background"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${day > 28 ? "text-[#71717A]" : "text-[#A1A1AA]"} md:text-base`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1 md:mt-2">
                        {dayEvents.map((event) => (
                          <Link
                            key={event.id}
                            href={`/earnings/${event.symbol}`}
                            className="block rounded bg-[#6366F1] px-1 py-0.5 transition-transform hover:scale-[1.02] md:px-2 md:py-1"
                          >
                            <p className="truncate text-xs font-semibold text-white md:text-sm">
                              {event.symbol}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 md:mt-8 md:flex-row md:gap-8 md:p-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#6366F1]" />
              <span className="text-sm text-[#A1A1AA]">有财报发布</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#3F3F46]" />
              <span className="text-sm text-[#A1A1AA]">无财报</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#22C55E]" />
              <span className="text-sm text-[#A1A1AA]">已分析</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
