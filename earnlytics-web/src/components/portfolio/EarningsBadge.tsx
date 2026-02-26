"use client"

import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface EarningsBadgeProps {
  daysUntil: number
  className?: string
}

export function EarningsBadge({ daysUntil, className }: EarningsBadgeProps) {
  const isUrgent = daysUntil <= 3

  if (daysUntil > 7) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", className)}
    >
      {isUrgent ? (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="relative flex h-2 w-2"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
        </motion.span>
      ) : (
        <Calendar className="h-3 w-3" />
      )}
      <span>
        {isUrgent ? "财报将发布" : `${daysUntil}天后财报`}
      </span>
    </motion.div>
  )
}

export function EarningsPill({ daysUntil }: { daysUntil: number }) {
  if (daysUntil <= 0) return null
  if (daysUntil > 30) return null

  const isUrgent = daysUntil <= 3
  const isSoon = daysUntil <= 7

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isUrgent && "bg-error/20 text-error",
        isSoon && !isUrgent && "bg-warning/20 text-warning",
        !isSoon && !isUrgent && "bg-primary/20 text-primary"
      )}
    >
      {isUrgent ? (
        <span className="mr-1.5 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-error" />
        </span>
      ) : null}
      Q{ Math.ceil((new Date().getMonth() + 3) / 3) } {daysUntil}天
    </motion.div>
  )
}
