import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { COMPANY_CIK_MAP, formatCIK } from '../../src/lib/sec-edgar/cik-map'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const SEC_EDGAR_BASE = 'https://data.sec.gov'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const USER_AGENT = 'Earnlytics (research@earnlytics.com)'

interface ParsedEarnings {
  fiscalYear: number
  fiscalQuarter: number
  reportDate: string
  revenue: number
  netIncome: number
  eps: number
}

async function fetchCompanyFilings(symbol: string): Promise<{ forms: string[]; dates: string[] } | null> {
  const cik = COMPANY_CIK_MAP[symbol]?.cik
  if (!cik) {
    throw new Error(`Unknown symbol: ${symbol}`)
  }
  
  const url = `${SEC_EDGAR_BASE}/submissions/CIK${formatCIK(cik)}.json`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  })
  
  if (!response.ok) {
    console.warn(`  ⚠ SEC API returned ${response.status} for ${symbol}`)
    return null
  }
  
  const data = await response.json()
  
  if (!data.filings?.recent) {
    return null
  }
  
  const recent = data.filings.recent
  return {
    forms: recent.form || [],
    dates: recent.filingDate || [],
  }
}

function parseFiscalQuarter(filingDate: string): { year: number; quarter: number } {
  const date = new Date(filingDate)
  const month = date.getMonth() + 1 // 1-12
  
  let quarter: number
  if (month >= 2 && month <= 4) quarter = 1  // Q1 ends around Feb-Apr
  else if (month >= 5 && month <= 7) quarter = 2  // Q2 ends around May-Jul
  else if (month >= 8 && month <= 10) quarter = 3 // Q3 ends around Aug-Oct
  else quarter = 4 // Q4 ends around Nov-Jan
  
  const year = date.getFullYear()
  
  return { year, quarter }
}

async function upsertEarnings(
  symbol: string,
  data: ParsedEarnings
) {
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()
  
  if (companyError || !companyData) {
    console.error(`  ✗ Company not found: ${symbol}`)
    return false
  }
  
  const { error } = await supabase
    .from('earnings')
    .upsert(
      {
        company_id: companyData.id,
        fiscal_year: data.fiscalYear,
        fiscal_quarter: data.fiscalQuarter,
        report_date: data.reportDate,
        revenue: data.revenue,
        net_income: data.netIncome,
        eps: data.eps,
        is_analyzed: false,
      },
      { onConflict: 'company_id,fiscal_year,fiscal_quarter' }
    )
  
  if (error) {
    console.error(`  ✗ Error upserting: ${error.message}`)
    return false
  }
  
  return true
}

async function fetchFromSECFilings(symbol: string): Promise<ParsedEarnings[]> {
  console.log(`  Fetching filings from SEC for ${symbol}...`)
  
  const data = await fetchCompanyFilings(symbol)
  
  if (!data) {
    return []
  }
  
  const { forms, dates } = data
  
  // 收集10-Q的索引
  const q10Indices: number[] = []
  for (let i = 0; i < forms.length; i++) {
    if (forms[i] === '10-Q') {
      q10Indices.push(i)
    }
  }
  
  console.log(`  Found ${q10Indices.length} 10-Q filings`)
  
  const results: ParsedEarnings[] = []
  
  // 取最近4个
  for (const idx of q10Indices.slice(0, 4)) {
    const filingDate = dates[idx]
    if (!filingDate) continue
    
    const { year, quarter } = parseFiscalQuarter(filingDate)
    
    results.push({
      fiscalYear: year,
      fiscalQuarter: quarter,
      reportDate: filingDate,
      revenue: 0,
      netIncome: 0,
      eps: 0,
    })
    
    console.log(`    → FY${year} Q${quarter} (${filingDate})`)
  }
  
  return results
}

async function syncFromSEC() {
  const tier = process.argv[2] || 'tier3'
  
  const tierSymbols: Record<string, string[]> = {
    tier1: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'CRM'],
    tier2: ['AVGO', 'ORCL', 'ADBE', 'IBM', 'INTC', 'QCOM', 'TXN', 'NOW', 'PANW', 'PLTR'],
    tier3: ['SNOW', 'CRWD', 'DDOG', 'NET', 'MDB', 'ZS', 'OKTA', 'DOCU', 'ROKU', 'UBER'],
  }
  
  const symbols = tierSymbols[tier] || tierSymbols.tier3
  
  console.log('========================================')
  console.log('SEC EDGAR Data Sync')
  console.log('========================================')
  console.log(`Tier: ${tier.toUpperCase()}`)
  console.log(`Companies: ${symbols.length}`)
  console.log('')
  
  console.log(`Syncing: ${symbols.join(', ')}\n`)
  
  let totalInserted = 0
  let totalErrors = 0
  
  for (const symbol of symbols) {
    try {
      console.log(`\nProcessing ${symbol}...`)
      
      const earnings = await fetchFromSECFilings(symbol)
      
      for (const data of earnings) {
        const success = await upsertEarnings(symbol, data)
        if (success) {
          totalInserted++
        } else {
          totalErrors++
        }
      }
      
      // Rate limiting - SEC要求
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (error) {
      console.error(`  ✗ Error: ${error}`)
      totalErrors++
    }
  }
  
  console.log('\n========================================')
  console.log('Sync Complete')
  console.log('========================================')
  console.log(`Inserted/Updated: ${totalInserted}`)
  console.log(`Errors: ${totalErrors}`)
  console.log('')
  
  return { inserted: totalInserted, errors: totalErrors }
}

syncFromSEC()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
