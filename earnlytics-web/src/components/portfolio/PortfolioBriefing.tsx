"use client"

import { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import { Bot, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PortfolioBriefingProps {
  userId: number
  className?: string
}

interface Briefing {
  content: string
  sentiment: 'positive' | 'neutral' | 'negative'
  highlights: string[]
  concerns: string[]
  createdAt?: string
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

export function PortfolioBriefing({ userId, className }: PortfolioBriefingProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [briefing, setBriefing] = useState<Briefing | null>(null)

  useEffect(() => {
    fetchBriefing()
  }, [userId])

  const fetchBriefing = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/portfolio/briefing?user_id=${userId}`)
      const json = await res.json()
      if (json.briefing) {
        setBriefing(json.briefing)
      }
    } catch (error) {
      console.error('Error fetching briefing:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateBriefing = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/portfolio/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      const json = await res.json()
      if (json.briefing) {
        setBriefing(json.briefing)
      } else if (json.error) {
        alert(json.error)
      }
    } catch (error) {
      console.error('Error generating briefing:', error)
      alert('生成简报失败')
    } finally {
      setGenerating(false)
    }
  }

  const getSentimentConfig = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: TrendingUp,
          color: 'text-success',
          bgColor: 'bg-success-light',
          label: '积极'
        }
      case 'negative':
        return {
          icon: TrendingDown,
          color: 'text-error',
          bgColor: 'bg-error-light',
          label: '谨慎'
        }
      default:
        return {
          icon: TrendingUp,
          color: 'text-text-secondary',
          bgColor: 'bg-white/5',
          label: '中性'
        }
    }
  }

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
        <div className="space-y-3">
          <div className="h-6 bg-white/5 rounded animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
        </div>
      </motion.div>
    )
  }

  const sentimentConfig = briefing ? getSentimentConfig(briefing.sentiment) : null

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                AI 投资简报
                <Sparkles className="h-4 w-4 text-primary" />
              </h3>
              <p className="text-xs text-text-secondary">基于持仓的智能分析</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={generateBriefing}
            disabled={generating}
            className="text-xs gap-1"
          >
            <RefreshCw className={cn("h-3 w-3", generating && "animate-spin")} />
            {generating ? '生成中...' : '刷新'}
          </Button>
        </div>

        {!briefing ? (
          <div className="text-center py-6">
            <Bot className="h-12 w-12 text-text-tertiary mx-auto mb-3 opacity-30" />
            <p className="text-sm text-text-secondary mb-3">暂无今日简报</p>
            <Button
              onClick={generateBriefing}
              disabled={generating}
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              生成简报
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sentimentConfig && (
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                sentimentConfig.bgColor,
                sentimentConfig.color
              )}>
                <sentimentConfig.icon className="h-3.5 w-3.5" />
                {sentimentConfig.label}
              </div>
            )}
            
            <p className="text-white leading-relaxed">
              {briefing.content}
            </p>

            {briefing.highlights && briefing.highlights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">亮点</p>
                <div className="flex flex-wrap gap-2">
                  {briefing.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-success/10 text-success rounded-md"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {briefing.concerns && briefing.concerns.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">关注点</p>
                <div className="flex flex-wrap gap-2">
                  {briefing.concerns.map((concern, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-warning/10 text-warning rounded-md flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {briefing.createdAt && (
              <p className="text-xs text-text-tertiary pt-2 border-t border-white/5">
                更新于 {new Date(briefing.createdAt).toLocaleString('zh-CN')}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
