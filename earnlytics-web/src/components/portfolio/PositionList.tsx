"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trash2, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioPosition } from "@/lib/supabase"
import { Sparkline } from "./Sparkline"
import { EarningsBadge } from "./EarningsBadge"

interface PositionListProps {
  positions: PortfolioPosition[]
  onDelete: (id: number) => void
  deleting?: number | null
  className?: string
  onPositionClick?: (position: PortfolioPosition) => void
  earningsData?: Record<string, { daysUntil: number; reportDate: string }>
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
}

export function PositionList({ positions, onDelete, deleting, className, onPositionClick, earningsData }: PositionListProps) {
  if (positions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl",
          "p-12 text-center",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary mx-auto">
            <TrendingUp className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">暂无持仓</h3>
          <p className="text-sm text-text-secondary">点击上方按钮添加您的第一个持仓</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <motion.div
        variants={itemVariants}
        className="relative z-10 border-b border-white/5 px-6 py-4"
      >
        <h3 className="text-lg font-semibold text-white">持仓明细</h3>
      </motion.div>

      <div className="relative z-10 divide-y divide-white/5">
        {positions.map((position) => {
          const isPositive = position.gain >= 0
          const earnings = earningsData?.[position.symbol]

          return (
            <motion.div
              key={position.id}
              variants={itemVariants}
              onClick={() => onPositionClick?.(position)}
              className={cn(
                "group flex items-center justify-between px-6 py-4",
                "transition-all duration-300 ease-out",
                "hover:bg-white/[0.03]",
                onPositionClick && "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-white/10">
                  {position.logo_url ? (
                    <img
                      src={position.logo_url}
                      alt={position.symbol}
                      className="h-8 w-8 rounded"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {position.symbol.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{position.symbol}</h4>
                    {earnings && earnings.daysUntil <= 7 && (
                      <EarningsBadge daysUntil={earnings.daysUntil} className="bg-warning/20 text-warning" />
                    )}
                    <a
                      href={`/companies/${position.symbol}`}
                      className="text-text-tertiary hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-sm text-text-secondary">{position.company_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right min-w-[60px]">
                  <Sparkline positive={isPositive} width={50} height={20} />
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-text-tertiary">持股数</p>
                  <p className="font-medium text-white">{position.shares}</p>
                </div>

                <div className="text-right min-w-[90px]">
                  <p className="text-xs text-text-tertiary">成本价</p>
                  <p className="font-medium text-white">${position.avg_cost_basis.toFixed(2)}</p>
                </div>

                <div className="text-right min-w-[90px]">
                  <p className="text-xs text-text-tertiary">现价</p>
                  <p className="font-medium text-white">${position.current_price.toFixed(2)}</p>
                </div>

                <div className="text-right min-w-[110px]">
                  <p className="text-xs text-text-tertiary">市值</p>
                  <p className="font-medium text-white">
                    ${position.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-right min-w-[90px]">
                  <p className="text-xs text-text-tertiary">盈亏</p>
                  <div className={cn(
                    "flex items-center gap-1.5",
                    isPositive ? "text-success" : "text-error"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {isPositive ? "+" : ""}{position.gain_pct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(position.id)
                  }}
                  disabled={deleting === position.id}
                  className="h-9 w-9 text-text-tertiary hover:text-error hover:bg-error/10 transition-all duration-200"
                >
                  {deleting === position.id ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
