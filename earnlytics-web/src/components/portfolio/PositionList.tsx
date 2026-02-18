"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioPosition } from "@/lib/supabase"

interface PositionListProps {
  positions: PortfolioPosition[]
  onDelete: (id: number) => void
  deleting?: number | null
  className?: string
}

export function PositionList({ positions, onDelete, deleting, className }: PositionListProps) {
  if (positions.length === 0) {
    return (
      <Card className={cn("bg-surface border-border", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
            <TrendingUp className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">暂无持仓</h3>
          <p className="text-sm text-text-secondary">点击上方按钮添加您的第一个持仓</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-surface border-border", className)}>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-white">持仓明细</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {positions.map((position) => {
          const isPositive = position.gain >= 0

          return (
            <div
              key={position.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary p-4 transition-colors hover:border-border-highlight/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
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
                    <a
                      href={`/companies/${position.symbol}`}
                      className="text-text-tertiary hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-sm text-text-secondary">{position.company_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-text-tertiary">持股数</p>
                  <p className="font-medium text-white">{position.shares}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-tertiary">成本价</p>
                  <p className="font-medium text-white">${position.avg_cost_basis.toFixed(2)}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-tertiary">现价</p>
                  <p className="font-medium text-white">${position.current_price.toFixed(2)}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-tertiary">市值</p>
                  <p className="font-medium text-white">
                    ${position.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-tertiary">盈亏</p>
                  <div className={cn("flex items-center gap-1", isPositive ? "text-success" : "text-error")}>
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
                  onClick={() => onDelete(position.id)}
                  disabled={deleting === position.id}
                  className="h-8 w-8 text-text-tertiary hover:text-error"
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
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
