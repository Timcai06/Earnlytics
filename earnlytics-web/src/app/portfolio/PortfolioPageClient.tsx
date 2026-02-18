"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortfolioSummary, PositionList, AddPositionDialog } from "@/components/portfolio"
import { cn } from "@/lib/utils"
import type { PortfolioPosition, PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase"

interface User {
  id: number
  name: string
  email: string
}

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/home")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  useEffect(() => {
    if (user) {
      fetchPortfolio()
    }
  }, [user])

  const fetchPortfolio = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/portfolio?user_id=${user.id}`)
      const data = await res.json()
      if (data.positions) {
        setPositions(data.positions)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

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
        fetchPortfolio()
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

    setDeleting(id)
    try {
      const res = await fetch(`/api/portfolio?id=${id}&user_id=${user.id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      if (result.success) {
        fetchPortfolio()
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
            <div>
              <h1 className="text-3xl font-bold text-white">我的持仓</h1>
              <p className="mt-1 text-text-secondary">跟踪您的投资组合表现</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              添加持仓
            </Button>
          </div>

          <PortfolioSummary summary={summary} />
        </div>
      </section>

      <section className="flex-1 bg-background px-4 py-8 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <PositionList
            positions={positions}
            onDelete={handleDeletePosition}
            deleting={deleting}
          />

          {positions.length > 0 && (
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
                  <p className="text-sm text-text-secondary">
                    查看您持仓公司的 upcoming 财报发布日期
                  </p>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/calendar')}>
                    查看财报日历
                  </Button>
                </div>
              </Card>

              <Card className="bg-surface border-border">
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light">
                    <Bot className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI 分析汇总</h3>
                    <p className="text-xs text-text-tertiary">持仓公司的最新 AI 投资观点</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-text-secondary">
                    基于 AI 分析的投资建议汇总
                  </p>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/companies')}>
                    查看公司分析
                  </Button>
                </div>
              </Card>
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
