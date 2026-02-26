"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortfolioSummary, PositionList, AddPositionDialog, Drawer, PositionDrawerContent, PortfolioHistoryChart, PortfolioBriefing } from "@/components/portfolio"
import { cn } from "@/lib/utils"
import type { PortfolioPosition, PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase"

interface User {
  id: number
  name: string
  email: string
}

interface EarningsInfo {
  symbol: string
  report_date: string
  days_until: number
}

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

export function PortfolioPageClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/home")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  const fetchPortfolio = useCallback(async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/portfolio?user_id=${user.id}`)
      const data = await res.json()
      if (data.positions) {
        setPositions(data.positions)
        setSummary(data.summary)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  const fetchEarnings = useCallback(async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/portfolio/earnings?user_id=${user.id}`)
      const data = await res.json()
      
      if (data.upcoming) {
        setUpcomingEarnings(data.upcoming)
        
        const earningsMap: Record<string, { daysUntil: number; reportDate: string }> = {}
        data.upcoming.forEach((e: EarningsInfo) => {
          earningsMap[e.symbol] = {
            daysUntil: e.days_until,
            reportDate: e.report_date
          }
        })
        setEarningsData(earningsMap)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchPortfolio()
      fetchEarnings()
    }
  }, [user, fetchPortfolio, fetchEarnings])

  useEffect(() => {
    if (!user || positions.length === 0) return

    const interval = setInterval(() => {
      setRefreshing(true)
      fetchPortfolio()
      fetchEarnings()
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [user, positions.length, fetchPortfolio, fetchEarnings])

  const handleAddPosition = async (data: { symbol: string; shares: number; cost_basis: number }) => {
    if (!user) return

    setAdding(true)
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...data
        })
      })
      const result = await res.json()
      
      if (result.success) {
        setDialogOpen(false)
        
        setLoading(true)
        await fetchPortfolio()
        await fetchEarnings()
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
    if (!user) return
    if (!confirm('确定要删除这个持仓吗？')) return

    const isDeletingCurrentDrawerPosition = selectedPosition?.id === id

    setDeleting(id)
    try {
      const res = await fetch(`/api/portfolio?id=${id}&user_id=${user.id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      if (result.success) {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
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
                  fetchPortfolio()
                  fetchEarnings()
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
              <PortfolioHistoryChart userId={user.id} />
              
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

                <PortfolioBriefing userId={user.id} />
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
