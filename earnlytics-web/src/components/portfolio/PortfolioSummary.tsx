"use client"

import { useMemo } from "react"
import { motion, type Variants } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Wallet, Percent, PieChart as PieChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioSummary as PortfolioSummaryType, PortfolioPosition } from "@/lib/supabase"

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType
  positions?: PortfolioPosition[]
  className?: string
}


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
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

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
]

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  colSpan?: number
  rowSpan?: number
}

function BentoCard({ children, className, colSpan = 1, rowSpan = 1 }: BentoCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl",
        "transition-all duration-300 ease-out",
        "hover:border-primary/30 hover:bg-surface/80 hover:shadow-lg hover:shadow-primary/5",
        colSpan === 2 ? "lg:col-span-2" : "lg:col-span-1",
        rowSpan === 2 ? "lg:row-span-2" : "lg:row-span-1",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-primary/5 blur-xl" />
      </div>
      <div className="relative z-10 h-full p-5">
        {children}
      </div>
    </motion.div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  isPositive,
  iconBgColor,
  iconColor,
  colSpan = 1
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  isPositive?: boolean
  iconBgColor: string
  iconColor: string
  colSpan?: number
}) {
  return (
    <BentoCard colSpan={colSpan}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          {subValue && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium",
              isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
            )}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {subValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-text-secondary">{label}</p>
          <p className={cn(
            "mt-1 text-2xl font-bold tracking-tight",
            isPositive === undefined ? "text-white" : isPositive ? "text-success" : "text-error"
          )}>
            {value}
          </p>
        </div>
      </div>
    </BentoCard>
  )
}

function AllocationChart({ positions }: { positions: PortfolioPosition[] }) {
  const chartData = useMemo(() => {
    if (!positions || positions.length === 0) return []

    const totalValue = positions.reduce((sum, p) => sum + p.current_value, 0)

    return positions
      .map(p => ({
        name: p.symbol,
        value: p.current_value,
        percentage: (p.current_value / totalValue) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [positions])

  if (chartData.length === 0) {
    return (
      <BentoCard className="flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <PieChartIcon className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-2 text-sm">暂无持仓数据</p>
        </div>
      </BentoCard>
    )
  }

  return (
    <BentoCard colSpan={2}>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <PieChartIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">资产配置</h3>
            <p className="text-xs text-text-secondary">持仓占比分布</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-6">
          {/* Pie Chart */}
          <div className="relative h-40 w-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-text-secondary">总计</span>
              <span className="text-lg font-bold text-white">{chartData.length}</span>
              <span className="text-xs text-text-secondary">只股票</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-36">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-white font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-text-secondary">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}

export function PortfolioSummary({ summary, positions = [], className }: PortfolioSummaryProps) {
  const isPositive = summary.total_gain >= 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn("grid grid-cols-1 gap-4 lg:grid-cols-4 lg:grid-rows-2", className)}
    >
      {/* Total Value - Large card */}
      <StatCard
        icon={Wallet}
        label="总市值"
        value={formatCurrency(summary.total_value)}
        subValue={isPositive ? `+${summary.total_gain_pct.toFixed(2)}%` : `${summary.total_gain_pct.toFixed(2)}%`}
        isPositive={isPositive}
        iconBgColor="bg-primary-light"
        iconColor="text-primary"
        colSpan={2}
      />

      {/* Total Cost */}
      <StatCard
        icon={Percent}
        label="总成本"
        value={formatCurrency(summary.total_cost)}
        iconBgColor="bg-info-light"
        iconColor="text-info"
      />

      {/* Total Gain/Loss */}
      <StatCard
        icon={isPositive ? TrendingUp : TrendingDown}
        label="总盈亏"
        value={formatCurrency(Math.abs(summary.total_gain))}
        subValue={isPositive ? "盈利" : "亏损"}
        isPositive={isPositive}
        iconBgColor={isPositive ? "bg-success-light" : "bg-error-light"}
        iconColor={isPositive ? "text-success" : "text-error"}
      />

      {/* Allocation Chart - Spans 2 columns */}
      <AllocationChart positions={positions} />

      {/* Return Rate - Small card */}
      <StatCard
        icon={isPositive ? TrendingUp : TrendingDown}
        label="收益率"
        value={`${isPositive ? "+" : ""}${summary.total_gain_pct.toFixed(2)}%`}
        isPositive={isPositive}
        iconBgColor={isPositive ? "bg-success-light" : "bg-error-light"}
        iconColor={isPositive ? "text-success" : "text-error"}
      />

      {/* Position Count */}
      <StatCard
        icon={PieChartIcon}
        label="持仓数量"
        value={`${summary.position_count} 只`}
        iconBgColor="bg-warning-light"
        iconColor="text-warning"
      />
    </motion.div>
  )
}
