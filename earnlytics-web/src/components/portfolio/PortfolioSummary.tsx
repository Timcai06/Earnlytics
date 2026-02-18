"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase"

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType
  className?: string
}

export function PortfolioSummary({ summary, className }: PortfolioSummaryProps) {
  const isPositive = summary.total_gain >= 0

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">总市值</p>
              <p className="text-lg font-semibold text-white">
                ${summary.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-light">
              <Percent className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">总成本</p>
              <p className="text-lg font-semibold text-white">
                ${summary.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isPositive ? "bg-success-light" : "bg-error-light"
            )}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-error" />
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">总盈亏</p>
              <p className={cn(
                "text-lg font-semibold",
                isPositive ? "text-success" : "text-error"
              )}>
                {isPositive ? "+" : ""}${summary.total_gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isPositive ? "bg-success-light" : "bg-error-light"
            )}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-error" />
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">收益率</p>
              <p className={cn(
                "text-lg font-semibold",
                isPositive ? "text-success" : "text-error"
              )}>
                {isPositive ? "+" : ""}{summary.total_gain_pct.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
