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
