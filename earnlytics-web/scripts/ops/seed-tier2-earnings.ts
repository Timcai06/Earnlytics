import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const tier2Symbols = ['AVGO', 'ORCL', 'ADBE', 'IBM', 'INTC', 'QCOM', 'TXN', 'NOW', 'PANW', 'PLTR']

async function getCompanyIds(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, symbol')
    .in('symbol', tier2Symbols)
  
  if (error || !data) {
    throw new Error(`Failed to fetch companies: ${error?.message}`)
  }
  
  const idMap: Record<string, number> = {}
  for (const company of data) {
    idMap[company.symbol] = company.id
  }
  
  return idMap
}

async function insertSampleEarnings(companyId: number, symbol: string) {
  const sampleData: Record<string, Array<{
    fiscalYear: number
    fiscalQuarter: number
    reportDate: string
    revenue: number
    netIncome: number
    eps: number
  }>> = {
    AVGO: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 14900000000, netIncome: 4300000000, eps: 9.32 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-09-30', revenue: 14000000000, netIncome: 3900000000, eps: 8.45 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-06-30', revenue: 13100000000, netIncome: 3400000000, eps: 7.38 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-03-31', revenue: 12500000000, netIncome: 3200000000, eps: 6.92 },
    ],
    ORCL: [
      { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2024-12-31', revenue: 14100000000, netIncome: 2400000000, eps: 0.84 },
      { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2024-09-30', revenue: 13300000000, netIncome: 2900000000, eps: 1.03 },
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-06-30', revenue: 14300000000, netIncome: 3100000000, eps: 1.11 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-03-31', revenue: 13300000000, netIncome: 2400000000, eps: 0.85 },
    ],
    ADBE: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-11-30', revenue: 5600000000, netIncome: 1700000000, eps: 3.79 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-08-31', revenue: 5400000000, netIncome: 1600000000, eps: 3.56 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-05-31', revenue: 5300000000, netIncome: 1500000000, eps: 3.35 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-02-29', revenue: 5200000000, netIncome: 1400000000, eps: 3.13 },
    ],
    IBM: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 17600000000, netIncome: 2900000000, eps: 3.13 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-09-30', revenue: 14900000000, netIncome: 1800000000, eps: 1.94 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-06-30', revenue: 15800000000, netIncome: 1900000000, eps: 2.05 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-03-31', revenue: 14500000000, netIncome: 1600000000, eps: 1.72 },
    ],
    INTC: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 14300000000, netIncome: -1800000000, eps: -0.41 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-09-30', revenue: 13300000000, netIncome: -1700000000, eps: -0.39 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-06-30', revenue: 12800000000, netIncome: -1700000000, eps: -0.39 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-03-31', revenue: 12700000000, netIncome: -400000000, eps: -0.09 },
    ],
    QCOM: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-09-30', revenue: 10200000000, netIncome: 2900000000, eps: 2.62 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-06-30', revenue: 9300000000, netIncome: 2100000000, eps: 1.88 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-03-31', revenue: 9400000000, netIncome: 2300000000, eps: 2.06 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2023-12-31', revenue: 9900000000, netIncome: 2700000000, eps: 2.40 },
    ],
    TXN: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 3900000000, netIncome: 1200000000, eps: 1.34 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-09-30', revenue: 4100000000, netIncome: 1300000000, eps: 1.47 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-06-30', revenue: 3900000000, netIncome: 1300000000, eps: 1.43 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-03-31', revenue: 3700000000, netIncome: 1100000000, eps: 1.20 },
    ],
    NOW: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 2900000000, netIncome: 300000000, eps: 1.46 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-09-30', revenue: 2800000000, netIncome: 300000000, eps: 1.40 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-06-30', revenue: 2600000000, netIncome: 200000000, eps: 1.02 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-03-31', revenue: 2500000000, netIncome: 300000000, eps: 1.20 },
    ],
    PANW: [
      { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-01-31', revenue: 2200000000, netIncome: 400000000, eps: 1.21 },
      { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2024-10-31', revenue: 2100000000, netIncome: 400000000, eps: 1.14 },
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-07-31', revenue: 2200000000, netIncome: 400000000, eps: 1.21 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-04-30', revenue: 2000000000, netIncome: 300000000, eps: 0.93 },
    ],
    PLTR: [
      { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 800000000, netIncome: 100000000, eps: 0.04 },
      { fiscalYear: 2024, fiscalQuarter: 3, reportDate: '2024-09-30', revenue: 700000000, netIncome: 100000000, eps: 0.04 },
      { fiscalYear: 2024, fiscalQuarter: 2, reportDate: '2024-06-30', revenue: 700000000, netIncome: 100000000, eps: 0.03 },
      { fiscalYear: 2024, fiscalQuarter: 1, reportDate: '2024-03-31', revenue: 600000000, netIncome: 100000000, eps: 0.03 },
    ],
  }
  
  const earnings = sampleData[symbol] || []
  let inserted = 0
  
  for (const data of earnings) {
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
          is_analyzed: false,
        },
        { onConflict: 'company_id,fiscal_year,fiscal_quarter' }
      )
    
    if (error) {
      console.error(`    ✗ Error: FY${data.fiscalYear} Q${data.fiscalQuarter} - ${error.message}`)
    } else {
      inserted++
      console.log(`    ✓ Inserted: FY${data.fiscalYear} Q${data.fiscalQuarter}`)
    }
  }
  
  return inserted
}

async function seedTier2Earnings() {
  console.log('Seeding Tier 2 earnings data...\n')
  
  try {
    const companyIds = await getCompanyIds()
    console.log(`Found ${Object.keys(companyIds).length} companies\n`)
    
    let totalInserted = 0
    
    for (const symbol of tier2Symbols) {
      const companyId = companyIds[symbol]
      if (!companyId) {
        console.log(`  ✗ ${symbol}: Company not found`)
        continue
      }
      
      console.log(`Processing ${symbol}...`)
      const inserted = await insertSampleEarnings(companyId, symbol)
      totalInserted += inserted
      console.log(`  → ${inserted} quarters inserted\n`)
    }
    
    console.log('========================================')
    console.log('Seed Summary')
    console.log('========================================')
    console.log(`Total earnings inserted: ${totalInserted}`)
    console.log('Expected: 40 (4 quarters × 10 companies)')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

seedTier2Earnings()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
