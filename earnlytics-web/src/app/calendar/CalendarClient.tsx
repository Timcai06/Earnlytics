"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import HorizontalGlow from "@/components/ui/horizontal-glow"
import { SectionLoading } from "@/components/ui/spinner"
import { Tooltip } from "@/components/ui/tooltip"
import { CalendarIcon, ListIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  id: number
  date: string
  symbol: string
  companyName: string
  fiscalYear: number
  fiscalQuarter: number
}

const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

type ViewMode = "calendar" | "list"

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
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMonthDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  const goToMonth = (targetMonth: number) => {
    setMonth(targetMonth)
    setMonthDropdownOpen(false)
  }

  const goToYear = (targetYear: number) => {
    setYear(targetYear)
    setMonthDropdownOpen(false)
  }

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ]

  // Get all events for list view
  const allEventsList = Object.entries(events).flatMap(([day, dayEvents]) =>
    dayEvents.map(e => ({ ...e, day: parseInt(day) }))
  ).sort((a, b) => a.day - b.day)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center">
          <HorizontalGlow position="bottom" />
          <div className="relative z-10 w-full flex flex-col items-center gap-6">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
              财报日历
            </h1>
            <p className="max-w-xl text-lg text-text-secondary">
              追踪即将发布的科技公司财报
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Content */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Calendar Grid */}
          <div className="rounded-2xl border border-primary bg-surface-secondary p-4 shadow-[var(--shadow-card-primary)] md:p-8">
            {/* Header */}
            <div className="mb-4 flex flex-col items-center justify-between gap-4 md:mb-6 md:flex-row">
              <div className="flex items-center gap-3">
                {/* Month Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-primary hover:bg-surface-secondary md:px-4 md:text-base"
                  >
                    {year}年{monthNames[month - 1]}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", monthDropdownOpen && "rotate-180")} />
                  </button>
                  
                  {/* Dropdown Panel */}
                  {monthDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-surface-secondary p-2 shadow-xl">
                      {/* Year Selection */}
                      <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                        <button
                          onClick={() => goToYear(year - 1)}
                          className="rounded p-1 text-text-secondary hover:bg-background hover:text-white"
                          aria-label="上一年"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold text-white">{year}年</span>
                        <button
                          onClick={() => goToYear(year + 1)}
                          className="rounded p-1 text-text-secondary hover:bg-background hover:text-white"
                          aria-label="下一年"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Month Grid */}
                      <div className="grid grid-cols-3 gap-1">
                        {monthNames.map((name, index) => (
                          <button
                            key={index}
                            onClick={() => goToMonth(index + 1)}
                            className={cn(
                              "rounded-lg px-2 py-1.5 text-sm transition-colors",
                              month === index + 1
                                ? "bg-primary text-white"
                                : "text-text-secondary hover:bg-background hover:text-white"
                            )}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={goToToday}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:bg-surface-secondary md:px-4"
                >
                  今天
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrevMonth}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-background hover:text-white"
                    aria-label="上月"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-background hover:text-white"
                    aria-label="下月"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center rounded-lg border border-border bg-background p-1">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                      viewMode === "calendar"
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-white"
                    )}
                    aria-label="日历视图"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">日历</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                      viewMode === "list"
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-white"
                    )}
                    aria-label="列表视图"
                  >
                    <ListIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">列表</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <SectionLoading className="py-20" />
            ) : viewMode === "calendar" ? (
              <>
                {/* Week Days Header */}
                <div className="mb-4 hidden grid-cols-7 gap-2 md:grid">
                  {weekDays.map((day) => (
                    <div key={day} className="py-3 text-center text-sm font-semibold text-text-tertiary">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
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

                    // Check if today
                    const now = new Date()
                    const isToday = now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day

                    return (
                      <div
                        key={day}
                        className={cn(
                          "min-h-[100px] rounded-lg p-2 transition-all md:min-h-[120px] md:p-3",
                          hasEvent
                            ? "border border-primary bg-primary-light/30 shadow-[var(--shadow-card-highlight)]"
                            : "bg-background",
                          isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-semibold md:text-base",
                            hasEvent ? "text-primary" : "text-text-secondary",
                            day > 28 && "text-text-tertiary"
                          )}>
                            {day}
                          </span>
                          {isToday && (
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                              今
                            </span>
                          )}
                        </div>
                        <div className="mt-1 space-y-1 md:mt-2">
                          {dayEvents.slice(0, 3).map((event) => (
                            <Tooltip
                              key={event.id}
                              content={
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{event.symbol}</span>
                                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                                      Q{event.fiscalQuarter}
                                    </span>
                                  </div>
                                  <div className="text-xs text-text-secondary">
                                    {event.companyName}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                                    <span>点击查看详情 →</span>
                                  </div>
                                </div>
                              }
                              side="top"
                              align="center"
                              maxWidth={200}
                            >
                              <Link
                                href={`/earnings/${event.symbol}`}
                                className="block rounded bg-primary px-1.5 py-1 text-xs font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90 md:px-2"
                              >
                                <span className="truncate">{event.symbol}</span>
                              </Link>
                            </Tooltip>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-text-tertiary">
                              +{dayEvents.length - 3} 更多
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              /* List View */
              <div className="space-y-2">
                {allEventsList.length === 0 ? (
                  <div className="py-12 text-center text-text-secondary">
                    本月暂无财报发布
                  </div>
                ) : (
                  allEventsList.map((event) => (
                    <Link
                      key={event.id}
                      href={`/earnings/${event.symbol}`}
                      className="group flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-primary hover:shadow-[var(--shadow-card-highlight)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light/30 text-lg font-bold text-primary">
                          {event.day}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white group-hover:text-primary">
                              {event.symbol}
                            </span>
                            <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                              Q{event.fiscalQuarter} {event.fiscalYear}
                            </span>
                          </div>
                          <div className="text-sm text-text-secondary">
                            {event.companyName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-text-tertiary">
                        <span className="text-sm">查看详情</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 md:mt-8 md:flex-row md:gap-8 md:p-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm text-text-secondary">有财报发布</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-surface-secondary" />
              <span className="text-sm text-text-secondary">无财报</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-sm text-text-secondary">已分析</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-primary" />
              <span className="text-sm text-text-secondary">今日</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
