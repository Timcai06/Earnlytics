"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, TrendingDown, Calendar, Bot, ExternalLink, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Drawer({ open, onClose, children, title }: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-surface border-l border-white/10 shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {title && (
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-text-secondary hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface PositionDrawerContentProps {
  position: {
    symbol: string
    company_name: string
    logo_url?: string | null
    shares: number
    avg_cost_basis: number
    current_price: number
    current_value: number
    gain: number
    gain_pct: number
  }
  earnings?: {
    nextDate?: string
    daysUntil?: number
    lastSummary?: string
    lastSentiment?: string
  }
  onClose: () => void
}

export function PositionDrawerContent({ position, earnings, onClose }: PositionDrawerContentProps) {
  const isPositive = position.gain >= 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-secondary border border-white/10">
          {position.logo_url ? (
            <img src={position.logo_url} alt={position.symbol} className="h-10 w-10 rounded" />
          ) : (
            <span className="text-2xl font-bold text-primary">{position.symbol.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{position.symbol}</h3>
          <p className="text-sm text-text-secondary">{position.company_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-surface-secondary border border-white/10 p-4">
          <p className="text-xs text-text-secondary">持股数</p>
          <p className="text-lg font-semibold text-white">{position.shares}</p>
        </div>
        <div className="rounded-xl bg-surface-secondary border border-white/10 p-4">
          <p className="text-xs text-text-secondary">成本价</p>
          <p className="text-lg font-semibold text-white">${position.avg_cost_basis.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-surface-secondary border border-white/10 p-4">
          <p className="text-xs text-text-secondary">现价</p>
          <p className="text-lg font-semibold text-white">${position.current_price.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-surface-secondary border border-white/10 p-4">
          <p className="text-xs text-text-secondary">市值</p>
          <p className="text-lg font-semibold text-white">${position.current_value.toLocaleString()}</p>
        </div>
      </div>

      <div className={cn(
        "flex items-center justify-between rounded-xl border p-4",
        isPositive ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
      )}>
        <div>
          <p className="text-sm text-text-secondary">总盈亏</p>
          <p className={cn("text-2xl font-bold", isPositive ? "text-success" : "text-error")}>
            {isPositive ? "+" : ""}${position.gain.toFixed(2)}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-3 py-1.5",
          isPositive ? "bg-success/20 text-success" : "bg-error/20 text-error"
        )}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-semibold">{isPositive ? "+" : ""}{position.gain_pct.toFixed(2)}%</span>
        </div>
      </div>

      {earnings && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Calendar className="h-4 w-4 text-primary" />
            财报信息
          </h4>
          
          {earnings.nextDate ? (
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">下次财报</p>
                  <p className="font-medium text-white">{earnings.nextDate}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-warning/20 px-3 py-1 text-warning">
                  <span className="text-sm font-medium">{earnings.daysUntil} 天后</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-surface-secondary p-4">
              <p className="text-sm text-text-secondary">近期无即将发布的财报</p>
            </div>
          )}

          {earnings.lastSummary && (
            <div className="space-y-3">
              <h5 className="flex items-center gap-2 text-sm font-medium text-white">
                <Bot className="h-4 w-4 text-primary" />
                上次 AI 分析
              </h5>
              <div className="rounded-xl border border-white/10 bg-surface-secondary p-4">
                <p className="text-sm text-text-secondary line-clamp-4">{earnings.lastSummary}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-white/10">
        <Button
          asChild
          className="w-full"
          variant={isPositive ? "default" : "destructive"}
        >
          <a href={`/companies/${position.symbol}`} className="flex items-center justify-center gap-2">
            查看公司详情
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full"
        >
          <a href={`/earnings/${position.symbol}`} className="flex items-center justify-center gap-2">
            查看财报分析
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
