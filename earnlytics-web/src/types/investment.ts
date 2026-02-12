export interface InvestmentRating {
  rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: 'high' | 'medium' | 'low'
  targetPrice: {
    low: number
    high: number
  }
  currentPrice: number
  investmentThesis: string[]
  keyRisks: string[]
  catalysts: string[]
}

export interface InvestmentAnalysis {
  symbol: string
  investmentRating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: 'high' | 'medium' | 'low'
  targetPrice: {
    low: number
    high: number
  }
  currentPrice: number
  financialQuality: {
    score: number
    roeDuPont: {
      netMargin: number
      assetTurnover: number
      equityMultiplier: number
    }
    cashFlowHealth: 'healthy' | 'moderate' | 'concerning'
  }
  growth: {
    stage: 'introduction' | 'growth' | 'maturity' | 'decline'
    revenueCAGR3Y: number
  }
  moat: {
    strength: 'wide' | 'narrow' | 'none'
    porterScore: number
  }
  valuation: {
    assessment: 'undervalued' | 'fair' | 'overvalued'
    pePercentile: number
  }
  keyPoints: string[]
  risks: string[]
  catalysts: string[]
  lastUpdated: string
}

// AI Assistant Types (Phase 6: Week 7-8)

export interface DocumentEmbedding {
  id: string
  sourceType: 'earnings' | 'research_report' | 'sec_filing' | 'analysis' | 'knowledge_base'
  sourceId: string
  symbol: string
  title: string
  contentChunk: string
  chunkIndex: number
  totalChunks: number
  embedding: number[]
  metadata: Record<string, unknown>
  createdAt: string
}

export interface ChatConversation {
  id: string
  userId?: string
  sessionId?: string
  title?: string
  symbol?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokensUsed?: number
  sources?: RAGSource[]
  processingTimeMs?: number
  createdAt: string
}

export interface RAGSource {
  sourceType: string
  sourceId: string
  title: string
  content: string
  similarity: number
}

export interface KnowledgeBaseArticle {
  id: string
  category: 'investing_basics' | 'financial_metrics' | 'industry_analysis' | 'market_strategy' | 'risk_management'
  title: string
  slug: string
  content: string
  summary?: string
  keywords: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SearchResult {
  id: string
  sourceType: string
  sourceId: string
  symbol: string
  title: string
  contentChunk: string
  similarity: number
  metadata: Record<string, unknown>
}

// Alert System Types (Phase 6: Week 8)

export interface AlertRule {
  id: string
  userId: string
  symbol?: string
  ruleType: 'rating_change' | 'target_price' | 'valuation_anomaly' | 'earnings_date' | 'price_threshold'
  conditions: AlertConditions
  notificationChannels: ('email' | 'push')[]
  name?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
  lastTriggeredAt?: string
  triggerCount?: number
}

export interface AlertConditions {
  threshold?: number
  direction?: 'up' | 'down'
  comparisonType?: 'absolute' | 'percentage'
  daysBefore?: number
}

export interface AlertHistory {
  id: string
  ruleId: string
  userId: string
  symbol: string
  alertType: string
  title: string
  message: string
  data: Record<string, unknown>
  priority: 'high' | 'medium' | 'low'
  isRead: boolean
  sentAt: string
  readAt?: string
}

export interface UserNotificationPreferences {
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  digestFrequency: 'immediate' | 'daily' | 'weekly'
  alertTypes: {
    rating_change: boolean
    target_price: boolean
    valuation_anomaly: boolean
    earnings_date: boolean
    price_threshold: boolean
  }
  quietHoursStart?: string
  quietHoursEnd?: string
  updatedAt: string
}
