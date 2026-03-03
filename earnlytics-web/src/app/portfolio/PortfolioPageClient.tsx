"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortfolioSummary, PositionList, AddPositionDialog, Drawer, PositionDrawerContent, PortfolioHistoryChart, PortfolioBriefing } from "@/components/portfolio"
import { cn } from "@/lib/utils"
import type { PortfolioPosition, PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase"
import { useAuthUser } from "@/hooks/use-auth-user"
import { redirectToLoginOnce } from "@/lib/auth/guard"

interface EarningsInfo {
  symbol: string
  report_date: string
  days_until: number
}

interface HistoryPoint {
  date: string
  value: number
  gain: number
  gainPct: number
}

interface HistorySummarySnapshot {
  startValue: number
  endValue: number
  change: number
  changePct: number
}

interface BriefingSnapshot {
  content: string
  sentiment: 'positive' | 'neutral' | 'negative'
  highlights: string[]
  concerns: string[]
  createdAt?: string
}

interface PortfolioOverviewResponse {
  positions: PortfolioPosition[]
  summary: PortfolioSummaryType
  earnings?: {
    upcoming: EarningsInfo[]
  }
  history?: {
    points: HistoryPoint[]
    summary: HistorySummarySnapshot | null
  }
  briefing?: BriefingSnapshot | null
}

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

export function PortfolioPageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthUser()
  const userId = user?.id ?? null
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [summary, setSummary] = useState<PortfolioSummaryType>({
    total_value: 0,
    total_cost: 0,
    total_gain: 0,
    total_gain_pct: 0,
    position_count: 0
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<PortfolioPosition | null>(null)
  const [earningsData, setEarningsData] = useState<Record<string, { daysUntil: number; reportDate: string }>>({})
  const [upcomingEarnings, setUpcomingEarnings] = useState<EarningsInfo[]>([])
  const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>([])
  const [historySummary, setHistorySummary] = useState<HistorySummarySnapshot | null>(null)
  const [briefingSnapshot, setBriefingSnapshot] = useState<BriefingSnapshot | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const redirectToLogin = useCallback(() => {
    redirectToLoginOnce(router, "/portfolio")
  }, [router])

  useEffect(() => {
    if (!authLoading && !userId) {
      redirectToLogin()
    }
  }, [authLoading, redirectToLogin, userId])

  const fetchOverview = useCallback(async () => {
    if (!userId) return

    try {
      const res = await fetch('/api/portfolio/overview')
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      const data = (await res.json()) as PortfolioOverviewResponse
      if (data.positions) {
        setPositions(data.positions)
      }
      if (data.summary) {
        setSummary(data.summary)
      }

      const upcoming = data.earnings?.upcoming || []
      setUpcomingEarnings(upcoming)

      const earningsMap: Record<string, { daysUntil: number; reportDate: string }> = {}
      upcoming.forEach((e) => {
        earningsMap[e.symbol] = {
          daysUntil: e.days_until,
          reportDate: e.report_date
        }
      })
      setEarningsData(earningsMap)

      setHistoryPoints(data.history?.points || [])
      setHistorySummary(data.history?.summary || null)
      setBriefingSnapshot(data.briefing ?? null)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching portfolio overview:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [redirectToLogin, userId])

  useEffect(() => {
    if (userId) {
      setLoading(true)
      void fetchOverview()
    }
  }, [userId, fetchOverview])

  useEffect(() => {
    if (!userId || positions.length === 0) return

    const interval = setInterval(() => {
      setRefreshing(true)
      void fetchOverview()
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [userId, positions.length, fetchOverview])

  const handleAddPosition = async (data: { symbol: string; shares: number; cost_basis: number }) => {
    if (!userId) return

    setAdding(true)
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data
        })
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      const result = await res.json()

      if (result.success) {
        setDialogOpen(false)
        setRefreshing(true)
        await fetchOverview()
      } else {
        alert(result.error || '添加失败')
      }
    } catch (error) {
      console.error('Error adding position:', error)
      alert('添加失败')
    } finally {
      setAdding(false)
    }
  }

  const handleDeletePosition = async (id: number) => {
    if (!userId) return
    if (!confirm('确定要删除这个持仓吗？')) return

    const isDeletingCurrentDrawerPosition = selectedPosition?.id === id

    setDeleting(id)
    try {
      const res = await fetch(`/api/portfolio?id=${id}`, {
        method: 'DELETE'
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      const result = await res.json()
      if (result.success) {
        const deletedPosition = positions.find((p) => p.id === id)

        if (isDeletingCurrentDrawerPosition) {
          setDrawerOpen(false)
          setSelectedPosition(null)
        }

        setPositions(prev => prev.filter(p => p.id !== id))

        const remainingPositions = positions.filter(p => p.id !== id)
        const totalValue = remainingPositions.reduce((sum, p) => sum + p.current_value, 0)
        const totalCost = remainingPositions.reduce((sum, p) => sum + p.total_cost, 0)
        const totalGain = totalValue - totalCost
        const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
        setSummary({
          total_value: totalValue,
          total_cost: totalCost,
          total_gain: totalGain,
          total_gain_pct: totalGainPct,
          position_count: remainingPositions.length
        })

        setUpcomingEarnings(prev => prev.filter((earning) => earning.symbol !== deletedPosition?.symbol))
        setEarningsData(prev => {
          const next = { ...prev }
          if (deletedPosition) {
            delete next[deletedPosition.symbol]
          }
          return next
        })

        setRefreshing(true)
        void fetchOverview()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting position:', error)
      alert('删除失败')
    } finally {
      setDeleting(null)
    }
  }

  const handlePositionClick = (position: PortfolioPosition) => {
    setSelectedPosition(position)
    setDrawerOpen(true)
  }

  if (!authLoading && !userId) {
    return null
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative overflow-hidden bg-surface px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-12 lg:px-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/[0.06] blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 h-[200px] w-[200px] rounded-full bg-success/[0.04] blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">我的持仓</h1>
                <p className="mt-1 text-text-secondary">跟踪您的投资组合表现</p>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <div className={cn("w-2 h-2 rounded-full", refreshing ? "bg-warning animate-pulse" : "bg-success")} />
                  {refreshing ? '刷新中...' : `更新于 ${lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRefreshing(true)
                  void fetchOverview()
                }}
                disabled={refreshing}
                className="gap-1.5"
              >
                <Loader2 className={cn("h-4 w-4", refreshing && "animate-spin")} />
                刷新
              </Button>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                添加持仓
              </Button>
            </div>
          </div>

          <PortfolioSummary summary={summary} positions={positions} />
        </div>
      </section>

      <section className="flex-1 bg-background px-4 py-8 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <PositionList
            positions={positions}
            onDelete={handleDeletePosition}
            deleting={deleting}
            onPositionClick={handlePositionClick}
            earningsData={earningsData}
          />

          {positions.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              <PortfolioHistoryChart
                initialRange={30}
                initialData={historyPoints}
                initialSummary={historySummary}
                skipInitialFetch
              />
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="bg-surface border-border">
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">持仓公司财报日历</h3>
                      <p className="text-xs text-text-tertiary">您持仓公司的 upcoming earnings</p>
                    </div>
                  </div>
                  <div className="p-4">
                    {upcomingEarnings.length > 0 ? (
                      <div className="space-y-2">
                        {upcomingEarnings.slice(0, 3).map((e, idx) => (
                          <div key={`${e.symbol}-${e.report_date}-${idx}`} className="flex items-center justify-between text-sm">
                            <span className="text-white font-medium">{e.symbol}</span>
                            <span className="text-text-secondary">{e.report_date} ({e.days_until}天)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        近期无即将发布的财报
                      </p>
                    )}
                    <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/calendar')}>
                      查看全部财报日历
                    </Button>
                  </div>
                </Card>

                <PortfolioBriefing initialBriefing={briefingSnapshot} />
              </div>
            </div>
          )}
        </div>
      </section>

      <AddPositionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddPosition}
        adding={adding}
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${selectedPosition?.symbol} 详情`}>
        {selectedPosition && (
          <PositionDrawerContent
            position={selectedPosition}
            earnings={selectedPosition.symbol in earningsData ? {
              nextDate: earningsData[selectedPosition.symbol].reportDate,
              daysUntil: earningsData[selectedPosition.symbol].daysUntil
            } : undefined}
          />
        )}
      </Drawer>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>
      {children}
    </div>
  )
}
