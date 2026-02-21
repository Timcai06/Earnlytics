"use client"

import { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface HistoryData {
  date: string
  value: number
  gain: number
  gainPct: number
}

interface PortfolioHistoryChartProps {
  userId: number
  className?: string
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
}

const timeRanges = [
  { label: '7天', days: 7 },
  { label: '30天', days: 30 },
  { label: '90天', days: 90 }
]

export function PortfolioHistoryChart({ userId, className }: PortfolioHistoryChartProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HistoryData[]>([])
  const [range, setRange] = useState(30)
  const [summary, setSummary] = useState<{
    startValue: number
    endValue: number
    change: number
    changePct: number
  } | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [userId, range])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/portfolio/history?user_id=${userId}&days=${range}`)
      const json = await res.json()
      if (json.history) {
        setData(json.history)
        setSummary(json.summary)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const isPositive = summary ? summary.change >= 0 : true

  if (loading) {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl p-5",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-light animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-48 bg-white/5 rounded-lg animate-pulse" />
      </motion.div>
    )
  }

  if (data.length === 0) {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl p-5",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">历史净值</h3>
            <p className="text-xs text-text-secondary">持仓市值变化趋势</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
          <Calendar className="h-12 w-12 opacity-30 mb-2" />
          <p className="text-sm">暂无历史数据</p>
          <p className="text-xs opacity-60">持仓变化后将自动记录</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl p-5",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">历史净值</h3>
              <p className="text-xs text-text-secondary">持仓市值变化趋势</p>
            </div>
          </div>
          
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {timeRanges.map(r => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  range === r.days 
                    ? "bg-primary text-white" 
                    : "text-text-secondary hover:text-white"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {summary && (
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-white">
              {formatValue(summary.endValue)}
            </span>
            <span className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-success" : "text-error"
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? '+' : ''}{summary.changePct.toFixed(2)}%
              <span className="text-text-tertiary text-xs">
                ({isPositive ? '+' : ''}{formatValue(summary.change)})
              </span>
            </span>
          </div>
        )}

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatValue}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18, 18, 26, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN')}
                formatter={(value: number) => [formatValue(value), '市值']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
