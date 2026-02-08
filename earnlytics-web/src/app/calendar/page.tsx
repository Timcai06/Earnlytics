"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";

const earningsEvents = [
  { date: 10, company: "Palantir", symbol: "PLTR", type: "盘后" as const },
  { date: 12, company: "NVIDIA", symbol: "NVDA", type: "盘后" as const },
  { date: 13, company: "Airbnb", symbol: "ABNB", type: "盘后" as const },
  { date: 18, company: "Microsoft", symbol: "MSFT", type: "盘前" as const },
  { date: 25, company: "Apple", symbol: "AAPL", type: "盘后" as const },
];

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday:
        year === today.getFullYear() &&
        month === today.getMonth() &&
        i === today.getDate(),
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return earningsEvents.filter((event) => event.date === day);
  };

  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="px-20 py-20 text-center">
        <h1 className="mb-4 text-[48px] font-bold text-text-primary">
          财报日历
        </h1>
        <p className="text-xl text-text-secondary">
          追踪即将发布的财报，把握投资机会
        </p>
      </section>

      <section className="px-20 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-text-primary">
              {year}年{monthNames[month]}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="grid grid-cols-7 border-b border-border bg-slate-50">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="px-4 py-3 text-center text-sm font-medium text-text-secondary"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((dateObj, index) => {
                const events = getEventsForDay(
                  dateObj.day,
                  dateObj.isCurrentMonth
                );
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-b border-r border-border p-3 ${
                      !dateObj.isCurrentMonth
                        ? "bg-slate-50/50 text-text-tertiary"
                        : ""
                    } ${dateObj.isToday ? "bg-primary/5" : ""}`}
                  >
                    <div
                      className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        dateObj.isToday
                          ? "bg-primary font-semibold text-white"
                          : "text-text-primary"
                      } ${!dateObj.isCurrentMonth ? "text-text-tertiary" : ""}`}
                    >
                      {dateObj.day}
                    </div>
                    <div className="space-y-1">
                      {events.map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                            {event.symbol[0]}
                          </div>
                          <span className="text-xs font-medium text-text-primary">
                            {event.symbol}
                          </span>
                          <span
                            className={`ml-auto text-[10px] ${
                              event.type === "盘前"
                                ? "text-amber-600"
                                : "text-primary"
                            }`}
                          >
                            {event.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                <Sun className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="text-sm text-text-secondary">盘前发布</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                <Moon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm text-text-secondary">盘后发布</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
