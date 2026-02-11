import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import type { FMPIncomeStatement } from '../src/types/database'

const fmpApiKey = process.env.FMP_API_KEY
const fmpApiUrl = process.env.FMP_API_URL || 'https://financialmodelingprep.com/api/v3'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!fmpApiKey) {
  throw new Error('FMP_API_KEY not configured')
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const TIER2_SYMBOLS = ['AVGO', 'ORCL', 'ADBE', 'IBM', 'INTC', 'QCOM', 'TXN', 'NOW', 'PANW', 'PLTR']

async function fetchIncomeStatements(symbol: string): Promise<FMPIncomeStatement[]> {
  const url = `${fmpApiUrl}/income-statement/${symbol}?apikey=${fmpApiKey}&limit=4`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`)
  }
  
  return response.json()
}

async function getCompanyId(symbol: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()
  
  if (error || !data) {
    console.error(`Company not found: ${symbol}`)
    return null
  }
  
  return data.id
}

async function upsertEarnings(
  companyId: number,
  data: {
    fiscalYear: number
    fiscalQuarter: number
    reportDate: string
    revenue: number
    netIncome: number
    eps: number
    epsEstimate?: number | null
  }
) {
  const { error } = await supabase
    .from('earnings')
    .upsert(
      {
        company_id: companyId,
        fiscal_year: data.fiscalYear,
        fiscal_quarter: data.fiscalQuarter,
        report_date: data.reportDate,
        revenue: data.revenue,
        net_income: data.netIncome,
        eps: data.eps,
        eps_estimate: data.epsEstimate || null,
        is_analyzed: false,
      },
      {
        onConflict: 'company_id,fiscal_year,fiscal_quarter',
      }
    )
  
  if (error) {
    console.error('Error upserting earnings:', error)
    return false
  }
  
  return true
}

function parseFiscalPeriod(period: string): { year: number; quarter: number } {
  const parts = period.split('-')
  const year = parseInt(parts[0])
  const month = parseInt(parts[1])
  
  let quarter: number
  if (month >= 1 && month <= 3) quarter = 2
  else if (month >= 4 && month <= 6) quarter = 3
  else if (month >= 7 && month <= 9) quarter = 4
  else quarter = 1
  
  const fiscalYear = quarter === 1 ? year + 1 : year
  
  return { year: fiscalYear, quarter }
}

async function backfillTier2Earnings() {
  console.log('Starting Tier 2 earnings backfill...')
  console.log(`Target companies: ${TIER2_SYMBOLS.join(', ')}`)
  
  let newEarningsCount = 0
  let errors: string[] = []
  
  for (const symbol of TIER2_SYMBOLS) {
    try {
      console.log(`\nFetching data for ${symbol}...`)
      
      const companyId = await getCompanyId(symbol)
      if (!companyId) {
        errors.push(`Company not found in database: ${symbol}`)
        continue
      }
      
      const incomeStatements = await fetchIncomeStatements(symbol)
      console.log(`  Found ${incomeStatements.length} quarters of data`)
      
      for (const statement of incomeStatements) {
        const { year, quarter } = parseFiscalPeriod(statement.period)
        
        const success = await upsertEarnings(companyId, {
          fiscalYear: year,
          fiscalQuarter: quarter,
          reportDate: statement.fillingDate,
          revenue: statement.revenue,
          netIncome: statement.netIncome,
          eps: statement.eps,
        })
        
        if (success) {
          newEarningsCount++
          console.log(`  ✓ Stored: ${symbol} FY${year} Q${quarter}`)
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`  ✗ Error processing ${symbol}:`, errorMessage)
      errors.push(`${symbol}: ${errorMessage}`)
    }
  }
  
  console.log('\n========================================')
  console.log('Backfill Summary')
  console.log('========================================')
  console.log(`Companies processed: ${TIER2_SYMBOLS.length}`)
  console.log(`New/Updated earnings: ${newEarningsCount}`)
  console.log(`Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
  
  return { newEarningsCount, errors }
}

backfillTier2Earnings()
  .then(result => {
    console.log('\nDone!')
    process.exit(result.errors.length > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
