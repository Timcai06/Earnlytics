import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if env vars are available (works during build too)
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }
  
  return supabaseInstance
}

// Export for backward compatibility
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export { createClient }

export type Database = {
  companies: Company
  earnings: Earning
  ai_analyses: AIAnalysis
}

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

export type User = {
  id: number
  email: string
  name: string | null
}

export type UserPortfolio = {
  id: number
  user_id: number
  symbol: string
  shares: number
  avg_cost_basis: number
  created_at: string
  updated_at: string
}

export type PortfolioPosition = {
  id: number
  symbol: string
  company_name: string
  logo_url: string | null
  shares: number
  avg_cost_basis: number
  current_price: number
  current_value: number
  total_cost: number
  gain: number
  gain_pct: number
  price_change: number
  price_change_pct: number
  price_timestamp: string | null
  is_stale: boolean
}

export type PortfolioMetadata = {
  last_updated: string
  price_expiry_minutes: number
  stale_positions: number
}

export type PortfolioSummary = {
  total_value: number
  total_cost: number
  total_gain: number
  total_gain_pct: number
  position_count: number
}
