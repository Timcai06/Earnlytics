"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Plus, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Company {
  symbol: string
  name: string
  logo_url: string | null
}

interface AddPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { symbol: string; shares: number; cost_basis: number }) => void
  adding?: boolean
  className?: string
}

export function AddPositionDialog({ open, onOpenChange, onAdd, adding, className }: AddPositionDialogProps) {
  const [symbol, setSymbol] = useState("")
  const [shares, setShares] = useState("")
  const [costBasis, setCostBasis] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchResults, setSearchResults] = useState<Company[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && companies.length === 0) {
      setLoadingCompanies(true)
      fetch('/api/companies')
        .then(res => res.json())
        .then(data => {
          setCompanies(data.companies || [])
        })
        .catch(err => console.error('Error loading companies:', err))
        .finally(() => setLoadingCompanies(false))
    }
  }, [open, companies.length])

  useEffect(() => {
    if (symbol.length > 0) {
      const filtered = companies.filter(c =>
        c.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
        c.name.toLowerCase().includes(symbol.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 5))
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [symbol, companies])

  const handleSelect = (company: Company) => {
    setSymbol(company.symbol)
    setShowResults(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!symbol) {
      setError("请输入股票代码")
      return
    }

    const sharesNum = parseFloat(shares)
    const costNum = parseFloat(costBasis)

    if (isNaN(sharesNum) || sharesNum <= 0) {
      setError("请输入有效的持股数量")
      return
    }

    if (isNaN(costNum) || costNum <= 0) {
      setError("请输入有效的成本价")
      return
    }

    onAdd({
      symbol: symbol.toUpperCase(),
      shares: sharesNum,
      cost_basis: costNum
    })
  }

  const handleClose = () => {
    setSymbol("")
    setShares("")
    setCostBasis("")
    setError("")
    setShowResults(false)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <Card className={cn("relative z-10 w-full max-w-md bg-surface border-border", className)}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold text-white">添加持仓</h3>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-sm font-medium text-text-secondary">
                股票代码
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <Input
                  id="symbol"
                  type="text"
                  placeholder="例如: AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onFocus={() => symbol && setShowResults(true)}
                  className="h-10 border-border bg-surface-secondary pl-10 text-white"
                />
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-surface-secondary shadow-lg">
                    {searchResults.map((company) => (
                      <button
                        key={company.symbol}
                        type="button"
                        onClick={() => handleSelect(company)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface"
                      >
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.symbol} className="h-6 w-6 rounded" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary">
                            {company.symbol.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{company.symbol}</p>
                          <p className="text-xs text-text-tertiary">{company.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {loadingCompanies && (
                <p className="text-xs text-text-tertiary">加载中...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares" className="text-sm font-medium text-text-secondary">
                持股数量
              </Label>
              <Input
                id="shares"
                type="number"
                placeholder="例如: 100"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="h-10 border-border bg-surface-secondary text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costBasis" className="text-sm font-medium text-text-secondary">
                成本价 (每股)
              </Label>
              <Input
                id="costBasis"
                type="number"
                step="0.01"
                placeholder="例如: 150.00"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                className="h-10 border-border bg-surface-secondary text-white"
              />
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={adding}
                className="flex-1"
              >
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    添加中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    添加持仓
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
