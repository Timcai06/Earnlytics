export type Company = {
  id: number
  symbol: string
  name: string
  sector: string | null
  logo_url: string | null
  created_at: string
}

export type Earning = {
  id: number
  company_id: number
  fiscal_year: number
  fiscal_quarter: number
  report_date: string
  revenue: number | null
  revenue_yoy_growth: number | null
  eps: number | null
  eps_estimate: number | null
  eps_surprise: number | null
  net_income: number | null
  is_analyzed: boolean
  created_at: string
}

export type AIAnalysis = {
  id: number
  earnings_id: number
  summary: string
  highlights: string[] | null
  concerns: string[] | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  tokens_used: number | null
  cost_usd: number | null
  created_at: string
}

export type EarningWithCompany = Earning & {
  companies: Company
}

export type EarningWithAnalysis = Earning & {
  companies: Company
  ai_analyses: AIAnalysis | null
}

export type FMPIncomeStatement = {
  symbol: string
  date: string
  revenue: number
  netIncome: number
  eps: number
  epsdiluted: number
  fiscalYear: string
  fillingDate: string
  period: string
}

export type FMPEarningsCalendar = {
  symbol: string
  date: string
  eps: number | null
  epsEstimated: number | null
  time: string
}

export type AIAnalysisResult = {
  summary: string
  highlights: string[]
  concerns: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}
