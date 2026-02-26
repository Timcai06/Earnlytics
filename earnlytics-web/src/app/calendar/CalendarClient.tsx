"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import HorizontalGlow from "@/components/ui/horizontal-glow"
import { SectionLoading } from "@/components/ui/spinner"
import { Tooltip } from "@/components/ui/tooltip"
import {
  ListIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Search,
  LayoutGrid,
  Zap,
} from "lucide-react"

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
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center relative z-10">
          <HorizontalGlow />
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              财报实时日程
            </h1>
            <div className="h-1.5 w-20 rounded-full bg-primary" />
          </div>

          <p className="max-w-2xl text-lg text-text-secondary leading-relaxed mb-8">
            高精度追踪科技股财报周期，AI 实时锁定投资信号。
          </p>

          <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-primary/40">
            <span>STATUS: ACTIVE</span>
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span>ENHANCED ANALYSIS ENABLED</span>
          </div>
        </div>

      </section>

      {/* Calendar Content */}
      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Calendar Grid */}
          <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-4 shadow-2xl md:p-10 overflow-hidden relative">

            {/* Header */}
            <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-4">
                {/* Month Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-all hover:border-primary/40 hover:bg-white/10"
                  >
                    <span className="font-mono text-primary/60 group-hover:text-primary">
                      {year}
                    </span>
                    <span className="text-lg">
                      {monthNames[month - 1]}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-500", monthDropdownOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {monthDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 top-full z-50 mt-3 w-64 rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-3xl"
                      >
                        {/* Year Selection */}
                        <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                          <button
                            onClick={() => goToYear(year - 1)}
                            className="rounded-xl p-2 text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="font-mono text-lg font-bold text-white tracking-widest">{year}</span>
                          <button
                            onClick={() => goToYear(year + 1)}
                            className="rounded-xl p-2 text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Month Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {monthNames.map((name, index) => (
                            <button
                              key={index}
                              onClick={() => goToMonth(index + 1)}
                              className={cn(
                                "rounded-xl px-2 py-3 text-sm font-bold transition-all",
                                month === index + 1
                                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                  : "text-text-secondary hover:bg-white/5 hover:text-white"
                              )}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={goToToday}
                  className="rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm font-bold text-text-secondary transition-all hover:text-white hover:bg-white/10"
                >
                  TODAY
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Navigation Controls */}
                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <button
                    onClick={goToPrevMonth}
                    className="rounded-xl p-2.5 text-text-secondary transition-all hover:bg-white/5 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <button
                    onClick={goToNextMonth}
                    className="rounded-xl p-2.5 text-text-secondary transition-all hover:bg-white/5 hover:text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-2xl bg-white/5 p-1.5 border border-white/5">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300",
                      viewMode === "calendar"
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-text-secondary hover:text-white"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline tracking-widest uppercase text-xs">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300",
                      viewMode === "list"
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-text-secondary hover:text-white"
                    )}
                  >
                    <ListIcon className="h-4 w-4" />
                    <span className="hidden sm:inline tracking-widest uppercase text-xs">List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Container with Scanning Effect */}
            <div className="relative min-h-[400px]">
              {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-4">
                    <SectionLoading />
                    <span className="font-mono text-[10px] font-bold tracking-[0.4em] text-primary animate-pulse">SYNCHRONIZING_DATA...</span>
                  </div>

                  {/* Scanning Beam */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#6366f1] z-30"
                  />
                </div>
              )}

              {viewMode === "calendar" ? (
                <>
                  {/* Week Days Header */}
                  <div className="mb-6 hidden grid-cols-7 gap-3 md:grid">
                    {weekDays.map((day) => (
                      <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
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

                      const now = new Date()
                      const isToday = now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day

                      return (
                        <motion.div
                          key={day}
                          whileHover={{ scale: 1.02, zIndex: 20 }}
                          className={cn(
                            "group/day relative min-h-[110px] rounded-2xl p-2 transition-all duration-300 md:min-h-[140px] md:p-4",
                            hasEvent
                              ? "bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                              : "bg-white/[0.02] ring-1 ring-white/5 hover:bg-white/[0.05]",
                            isToday && "ring-2 ring-primary ring-offset-4 ring-offset-slate-950"
                          )}
                        >
                          {/* Day Number and Status */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={cn(
                              "font-mono text-sm font-black md:text-lg transition-colors",
                              hasEvent ? "text-primary" : "text-white/40 group-hover/day:text-white/70",
                            )}>
                              {day.toString().padStart(2, '0')}
                            </span>

                            {isToday && (
                              <div className="relative">
                                <Target className="h-5 w-5 text-primary animate-pulse" />
                                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
                              </div>
                            )}

                            {hasEvent && !isToday && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shadow-[0_0_8px_#6366f1]" />
                            )}
                          </div>

                          {/* Event Tags */}
                          <div className="space-y-1.5">
                            {dayEvents.slice(0, 3).map((event) => (
                              <Tooltip
                                key={event.id}
                                content={
                                  <div className="p-1 space-y-2">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                      <span className="font-mono text-base font-black text-white">{event.symbol}</span>
                                      <span className="rounded-md bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                                        Q{event.fiscalQuarter}-FY{event.fiscalYear}
                                      </span>
                                    </div>
                                    <div className="text-xs font-medium text-text-secondary">
                                      {event.companyName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80">
                                      <Zap className="h-3 w-3" />
                                      <span>AI ANALYSIS READY</span>
                                    </div>
                                  </div>
                                }
                                side="top"
                                align="center"
                              >
                                <Link
                                  href={`/earnings/${event.symbol}`}
                                  className="relative block group/item"
                                >
                                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 border border-white/5 transition-all group-hover/item:bg-primary group-hover/item:border-primary">
                                    <span className="truncate font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                                      {event.symbol}
                                    </span>
                                  </div>
                                </Link>
                              </Tooltip>
                            ))}

                            {dayEvents.length > 3 && (
                              <div className="px-1 text-[10px] font-mono font-bold text-primary/40 uppercase">
                                + {dayEvents.length - 3} more
                              </div>
                            )}
                          </div>

                          {/* Hover Tactical Decoration */}
                          <div className="absolute inset-0 border-2 border-primary/0 rounded-2xl transition-all duration-500 group-hover/day:border-primary/20 pointer-events-none" />
                        </motion.div>
                      )
                    })}
                  </div>
                </>
              ) : (
                /* List View */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {allEventsList.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Search className="h-6 w-6 text-white/20" />
                      </div>
                      <span className="font-mono text-sm font-bold text-text-tertiary uppercase tracking-widest">
                        No matching events found for this cycle
                      </span>
                    </div>
                  ) : (
                    allEventsList.map((event) => (
                      <Link
                        key={event.id}
                        href={`/earnings/${event.symbol}`}
                        className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:border-primary/40 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                            <span className="font-mono text-lg font-black text-primary">{event.day.toString().padStart(2, '0')}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xl font-black text-white group-hover:text-primary transition-colors">
                                {event.symbol}
                              </span>
                              <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-text-secondary">
                                Q{event.fiscalQuarter} FY{event.fiscalYear}
                              </span>
                            </div>
                            <div className="mt-1 text-sm font-medium text-text-secondary truncate max-w-[180px]">
                              {event.companyName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-primary/40 group-hover:text-primary transition-all">
                          <span className="font-mono text-[10px] font-black uppercase tracking-widest hidden sm:block">Details</span>
                          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))
                  )}
                </motion.div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#6366f1]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Upcoming</span>
                  <span className="text-[9px] text-text-tertiary font-medium">有财报发布</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Idle Cycle</span>
                  <span className="text-[9px] text-text-tertiary font-medium">无财报计划</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Analyzed</span>
                  <span className="text-[9px] text-text-tertiary font-medium">AI 已完成解析</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full border border-primary animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Current Node</span>
                  <span className="text-[9px] text-text-tertiary font-medium">今日时间节点</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
