import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FMP_API_KEY = process.env.FMP_API_KEY

interface FMPQuarterlyRecord {
  calendarYear: string
  period: string
  revenue: number
  netIncome: number
  eps: number
}

async function fetchEarningsFromFMP(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&apikey=${FMP_API_KEY}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`)
  }
  
  return response.json() as Promise<FMPQuarterlyRecord[]>
}

async function updateEarnings() {
  const symbol = 'AAPL'
  
  console.log(`Fetching FMP data for ${symbol}...`)
  const fmpData = await fetchEarningsFromFMP(symbol)
  
  console.log(`Found ${fmpData.length} records from FMP`)
  
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()
  
  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, fiscal_year, fiscal_quarter, report_date')
    .eq('company_id', company?.id)
    .is('revenue', null)
  
  console.log(`Found ${earnings?.length} earnings without revenue`)
  
  for (const earning of earnings || []) {
    const fiscalYear = earning.fiscal_year
    const fiscalQuarter = earning.fiscal_quarter
    
    const matchingFMP = fmpData.find((fmp) => {
      const fmpYear = parseInt(fmp.calendarYear)
      const fmpPeriod = fmp.period
      return fmpYear === fiscalYear && fmpPeriod === `Q${fiscalQuarter}`
    })
    
    if (matchingFMP) {
      console.log(`Updating FY${fiscalYear} Q${fiscalQuarter}:`, {
        revenue: matchingFMP.revenue,
        netIncome: matchingFMP.netIncome,
        eps: matchingFMP.eps
      })
      
      const { error } = await supabase
        .from('earnings')
        .update({
          revenue: matchingFMP.revenue,
          net_income: matchingFMP.netIncome,
          eps: matchingFMP.eps,
        })
        .eq('id', earning.id)
      
      if (error) {
        console.error(`Error updating ${earning.id}:`, error)
      } else {
        console.log(`✓ Updated earnings ${earning.id}`)
      }
    } else {
      console.warn(`No FMP data found for FY${fiscalYear} Q${fiscalQuarter}`)
    }
  }
}

updateEarnings().then(() => {
  console.log('Done!')
  process.exit(0)
}).catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
