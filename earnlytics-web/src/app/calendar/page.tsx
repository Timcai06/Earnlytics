export default function CalendarPage() {
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background px-20 py-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-[40px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            财报日历
          </h1>
          <p className="text-lg text-[#A1A1AA]">追踪即将发布的科技公司财报</p>
        </div>
      </section>

      {/* Calendar Content */}
      <section className="bg-background px-20 pb-24">
        <div className="mx-auto max-w-6xl">
          {/* Calendar Grid */}
          <div className="rounded-2xl border border-[#6366F1] bg-surface-secondary p-8 shadow-[0_0_20px_rgba(99,102,241,0.13)]">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">2026年2月</h2>
              <div className="flex gap-2">
                <button className="rounded-lg px-3 py-2 text-sm text-[#A1A1AA] hover:bg-[#27272A]">
                  ← 上月
                </button>
                <button className="rounded-lg px-3 py-2 text-sm text-[#A1A1AA] hover:bg-[#27272A]">
                  下月 →
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="mb-4 grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div key={day} className="py-3 text-center text-sm font-semibold text-[#71717A]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const hasEvent = day === 12 || day === 14;
                return (
                  <div
                    key={day}
                    className={`min-h-[120px] rounded-lg p-3 ${
                      hasEvent
                        ? "border border-[#6366F1] bg-[rgba(99,102,241,0.15)] shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                        : "bg-background"
                    }`}
                  >
                    <span className={`text-base font-semibold ${day > 28 ? "text-[#71717A]" : "text-[#A1A1AA]"}`}>
                      {day}
                    </span>
                    {day === 12 && (
                      <div className="mt-2 rounded bg-[#6366F1] px-2 py-1">
                        <p className="text-xs font-semibold text-white">AAPL</p>
                        <p className="text-[10px] text-[#E0E7FF]">盘后</p>
                      </div>
                    )}
                    {day === 14 && (
                      <div className="mt-2 rounded bg-[#6366F1] px-2 py-1">
                        <p className="text-xs font-semibold text-white">MSFT</p>
                        <p className="text-[10px] text-[#E0E7FF]">盘后</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex gap-8 rounded-xl border border-border bg-surface-secondary p-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#6366F1]" />
              <span className="text-sm text-[#A1A1AA]">有财报发布</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#3F3F46]" />
              <span className="text-sm text-[#A1A1AA]">无财报</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
