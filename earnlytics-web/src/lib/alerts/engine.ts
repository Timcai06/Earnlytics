import { supabase } from '@/lib/supabase'
import { AlertRule, AlertHistory, AlertConditions } from '@/types/investment'

export interface RuleEvaluationResult {
  triggered: boolean
  title?: string
  message?: string
  data?: Record<string, unknown>
  priority?: 'low' | 'medium' | 'high'
}

export interface EvaluationContext {
  symbol: string
  currentPrice?: number
  previousPrice?: number
  currentRating?: string
  previousRating?: string
  targetPrice?: number
  previousTargetPrice?: number
  peRatio?: number
  pePercentile?: number
  earningsDate?: string
}

/**
 * Evaluate all active alert rules for a symbol
 */
export async function evaluateRulesForSymbol(
  symbol: string,
  context: EvaluationContext
): Promise<Array<{ rule: AlertRule; result: RuleEvaluationResult }>> {
  

  // Get all active rules for this symbol or portfolio-wide
  const { data: rules, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('is_active', true)
    .or(`symbol.eq.${symbol},symbol.is.null`)

  if (error) {
    console.error('Failed to fetch alert rules:', error)
    return []
  }

  const results: Array<{ rule: AlertRule; result: RuleEvaluationResult }> = []

  for (const rule of (rules || []) as AlertRule[]) {
    const result = await evaluateRule(rule, context)
    if (result.triggered) {
      results.push({ rule, result })
    }
  }

  return results
}

/**
 * Evaluate a single rule against current context
 */
export async function evaluateRule(
  rule: AlertRule,
  context: EvaluationContext
): Promise<RuleEvaluationResult> {
  const conditions = rule.conditions as AlertConditions

  switch (rule.ruleType) {
    case 'rating_change':
      return evaluateRatingChange(conditions, context)

    case 'target_price':
      return evaluateTargetPriceChange(conditions, context)

    case 'valuation_anomaly':
      return evaluateValuationAnomaly(conditions, context)

    case 'earnings_date':
      return evaluateEarningsDate(conditions, context)

    case 'price_threshold':
      return evaluatePriceThreshold(conditions, context)

    default:
      return { triggered: false }
  }
}

/**
 * Evaluate rating change rule
 */
function evaluateRatingChange(
  conditions: AlertConditions,
  context: EvaluationContext
): RuleEvaluationResult {
  const { currentRating, previousRating } = context

  if (!currentRating || !previousRating) {
    return { triggered: false }
  }

  if (currentRating !== previousRating) {
    const ratingOrder = ['sell', 'hold', 'buy']
    const currentIdx = ratingOrder.indexOf(currentRating)
    const previousIdx = ratingOrder.indexOf(previousRating)

    let changeDirection = '调整'
    if (currentIdx > previousIdx) {
      changeDirection = '上调'
    } else if (currentIdx < previousIdx) {
      changeDirection = '下调'
    }

    return {
      triggered: true,
      title: `${context.symbol} 分析师评级${changeDirection}至 ${currentRating.toUpperCase()}`,
      message: `${context.symbol} 的分析师共识评级从 ${previousRating.toUpperCase()} 调整为 ${currentRating.toUpperCase()}。这一变化可能影响投资决策，建议查看最新分析报告。`,
      data: {
        previousRating,
        newRating: currentRating,
        changeDirection,
      },
      priority: 'high',
    }
  }

  return { triggered: false }
}

/**
 * Evaluate target price change rule
 */
function evaluateTargetPriceChange(
  conditions: AlertConditions,
  context: EvaluationContext
): RuleEvaluationResult {
  const { targetPrice, previousTargetPrice } = context
  const threshold = conditions.threshold || 10

  if (!targetPrice || !previousTargetPrice) {
    return { triggered: false }
  }

  const changePercent = ((targetPrice - previousTargetPrice) / previousTargetPrice) * 100

  if (Math.abs(changePercent) >= threshold) {
    const direction = changePercent > 0 ? '上调' : '下调'
    const absChange = Math.abs(changePercent).toFixed(1)

    return {
      triggered: true,
      title: `${context.symbol} 目标价${direction} ${absChange}%`,
      message: `${context.symbol} 的分析师共识目标价从 $${previousTargetPrice.toFixed(2)} 调整为 $${targetPrice.toFixed(2)}（${direction} ${absChange}%）。`,
      data: {
        previousPrice: previousTargetPrice,
        newPrice: targetPrice,
        changePercent,
        direction,
      },
      priority: 'high',
    }
  }

  return { triggered: false }
}

/**
 * Evaluate valuation anomaly rule
 */
function evaluateValuationAnomaly(
  conditions: AlertConditions,
  context: EvaluationContext
): RuleEvaluationResult {
  const { peRatio, pePercentile } = context
  const threshold = conditions.threshold || 95

  if (!peRatio || pePercentile === undefined) {
    return { triggered: false }
  }

  if (pePercentile >= threshold) {
    return {
      triggered: true,
      title: `${context.symbol} 估值处于历史${pePercentile}%分位`,
      message: `${context.symbol} 的 P/E 目前为 ${peRatio.toFixed(2)}，处于历史 5 年的 ${pePercentile}% 分位。这可能表示估值偏高，建议关注。`,
      data: {
        metric: 'P/E',
        currentValue: peRatio,
        percentile: pePercentile,
        lookbackPeriod: '5年',
        assessment: '偏高',
      },
      priority: 'medium',
    }
  }

  if (pePercentile <= 100 - threshold) {
    return {
      triggered: true,
      title: `${context.symbol} 估值处于历史${pePercentile}%分位`,
      message: `${context.symbol} 的 P/E 目前为 ${peRatio.toFixed(2)}，处于历史 5 年的 ${pePercentile}% 分位。这可能表示估值偏低，存在投资机会。`,
      data: {
        metric: 'P/E',
        currentValue: peRatio,
        percentile: pePercentile,
        lookbackPeriod: '5年',
        assessment: '偏低',
      },
      priority: 'medium',
    }
  }

  return { triggered: false }
}

/**
 * Evaluate earnings date rule
 */
function evaluateEarningsDate(
  conditions: AlertConditions,
  context: EvaluationContext
): RuleEvaluationResult {
  const { earningsDate } = context
  const daysBefore = conditions.daysBefore || 3

  if (!earningsDate) {
    return { triggered: false }
  }

  const earnings = new Date(earningsDate)
  const today = new Date()
  const diffTime = earnings.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === daysBefore) {
    return {
      triggered: true,
      title: `${context.symbol} 即将发布财报`,
      message: `${context.symbol} 将在 ${daysBefore} 天后发布财报（${earningsDate}）。历史财报表现和AI分析已就绪，可提前查看。`,
      data: {
        days: daysBefore,
        date: earningsDate,
        symbol: context.symbol,
      },
      priority: 'medium',
    }
  }

  return { triggered: false }
}

/**
 * Evaluate price threshold rule
 */
function evaluatePriceThreshold(
  conditions: AlertConditions,
  context: EvaluationContext
): RuleEvaluationResult {
  const { currentPrice, previousPrice } = context
  const threshold = conditions.threshold
  const direction = conditions.direction

  if (!currentPrice || !previousPrice || threshold === undefined) {
    return { triggered: false }
  }

  const crossedUp = previousPrice < threshold && currentPrice >= threshold
  const crossedDown = previousPrice > threshold && currentPrice <= threshold

  if ((direction === 'up' && crossedUp) || (direction === 'down' && crossedDown) || (!direction && (crossedUp || crossedDown))) {
    const condition = crossedUp ? '突破' : '跌破'

    return {
      triggered: true,
      title: `${context.symbol} 股价${condition} $${threshold}`,
      message: `${context.symbol} 当前股价 $${currentPrice.toFixed(2)} 已${condition}您设定的阈值 $${threshold}。目标达成！建议查看最新分析以决定后续操作。`,
      data: {
        currentPrice,
        threshold,
        condition,
        direction: crossedUp ? 'up' : 'down',
      },
      priority: 'low',
    }
  }

  return { triggered: false }
}
