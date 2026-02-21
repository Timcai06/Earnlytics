"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SparklineProps {
  data?: number[]
  width?: number
  height?: number
  positive?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  positive = true,
  className
}: SparklineProps) {
  const defaultData = positive
    ? [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5]
    : [6, 5, 6, 4, 5, 3, 4, 2, 3, 1, 2]

  const chartData = data || defaultData
  const min = Math.min(...chartData)
  const max = Math.max(...chartData)
  const range = max - min || 1

  const points = chartData.map((value, index) => {
    const x = (index / (chartData.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const color = positive ? "#22c55e" : "#ef4444"

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <motion.path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      <motion.circle
        cx={width}
        cy={((chartData[chartData.length - 1] - min) / range) * (height - 4) * -1 + height - 2}
        r="2.5"
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
    </svg>
  )
}

interface MiniTrendIndicatorProps {
  positive: boolean
  className?: string
}

export function MiniTrendIndicator({ positive, className }: MiniTrendIndicatorProps) {
  return (
    <Sparkline
      positive={positive}
      width={40}
      height={16}
      className={className}
    />
  )
}
