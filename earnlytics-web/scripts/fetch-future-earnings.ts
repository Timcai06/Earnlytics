import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import type { FMPEarningsCalendar } from '../src/types/database'

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

const SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META',
  'AMZN', 'TSLA', 'AMD', 'NFLX', 'CRM',
  'AVGO', 'ORCL', 'ADBE', 'IBM', 'INTC',
  'QCOM', 'TXN', 'NOW', 'PANW', 'PLTR',
  'SNOW', 'CRWD', 'DDOG', 'NET', 'MDB',
  'ZS', 'OKTA', 'DOCU', 'ROKU', 'UBER'
]

async function fetchEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendar[]> {
  const url = `${fmpApiUrl}/earning_calendar?from=${from}&to=${to}&apikey=${fmpApiKey}`
  
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
    eps?: number | null
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
        eps: data.eps,
        eps_estimate: data.epsEstimate,
        is_analyzed: false,
        data_source: 'fmp',
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

function parseFiscalPeriod(date: string): { year: number; quarter: number } {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  
  let quarter: number
  if (month >= 1 && month <= 3) quarter = 1
  else if (month >= 4 && month <= 6) quarter = 2
  else if (month >= 7 && month <= 9) quarter = 3
  else quarter = 4
  
  return { year, quarter }
}

async function fetchFutureEarnings() {
  console.log('=== Fetching Future Earnings Calendar ===\n')
  
  const today = new Date()
  const from = today.toISOString().split('T')[0]
  
  const futureDate = new Date(today)
  futureDate.setMonth(futureDate.getMonth() + 3)
  const to = futureDate.toISOString().split('T')[0]
  
  console.log(`Fetching earnings from ${from} to ${to}...\n`)
  
  let newEarningsCount = 0
  let errors: string[] = []
  
  try {
    const calendarData = await fetchEarningsCalendar(from, to)
    
    console.log(`Found ${calendarData.length} total earnings events\n`)
    
    const filteredData = calendarData.filter(e => 
      SYMBOLS.includes(e.symbol.toUpperCase())
    )
    
    console.log(`Filtered to ${filteredData.length} events for tracked companies\n`)
    
    for (const event of filteredData) {
      try {
        const symbol = event.symbol.toUpperCase()
        const companyId = await getCompanyId(symbol)
        
        if (!companyId) {
          console.log(`  Skipping: Company not found - ${symbol}`)
          continue
        }
        
        const { year, quarter } = parseFiscalPeriod(event.date)
        
        const success = await upsertEarnings(companyId, {
          fiscalYear: year,
          fiscalQuarter: quarter,
          reportDate: event.date,
          eps: event.eps,
          epsEstimate: event.epsEstimated,
        })
        
        if (success) {
          newEarningsCount++
          console.log(`  ✓ ${symbol} - ${event.date} Q${quarter} FY${year}`)
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`  ✗ Error processing ${event.symbol}:`, errorMessage)
        errors.push(`${event.symbol}: ${errorMessage}`)
      }
    }
  } catch (error) {
    console.error('Fatal error:', error)
  }
  
  console.log('\n=== Summary ===')
  console.log(`New/Updated earnings: ${newEarningsCount}`)
  console.log(`Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
}

fetchFutureEarnings()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
