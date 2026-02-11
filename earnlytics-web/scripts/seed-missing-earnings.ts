import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const MISSING_SYMBOLS = ['CRWD', 'DOCU', 'MDB', 'NET', 'NOW', 'OKTA', 'PANW', 'PLTR', 'ROKU', 'TXN', 'ZS']

const SAMPLE_EARNINGS: Record<string, Array<{
  fiscalYear: number
  fiscalQuarter: number
  reportDate: string
  revenue: number
  netIncome: number
  eps: number
}>> = {
  CRWD: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-04', revenue: 401000000, netIncome: 30000000, eps: 0.28 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-04', revenue: 364000000, netIncome: 23000000, eps: 0.21 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-05', revenue: 337000000, netIncome: 17000000, eps: 0.15 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-04', revenue: 315000000, netIncome: 24000000, eps: 0.22 },
  ],
  DOCU: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-05', revenue: 736000000, netIncome: 53000000, eps: 0.26 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-05', revenue: 715000000, netIncome: 46000000, eps: 0.23 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-06', revenue: 691000000, netIncome: 41000000, eps: 0.20 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-05', revenue: 668000000, netIncome: 36000000, eps: 0.18 },
  ],
  MDB: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-05', revenue: 475000000, netIncome: -48000000, eps: -0.26 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-05', revenue: 444000000, netIncome: -44000000, eps: -0.24 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-05', revenue: 418000000, netIncome: -39000000, eps: -0.21 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-05', revenue: 389000000, netIncome: -35000000, eps: -0.19 },
  ],
  NET: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-05', revenue: 415000000, netIncome: 26000000, eps: 0.08 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-05', revenue: 390000000, netIncome: 21000000, eps: 0.06 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-05', revenue: 365000000, netIncome: 17000000, eps: 0.05 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-05', revenue: 342000000, netIncome: 14000000, eps: 0.04 },
  ],
  NOW: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-10', revenue: 2800000000, netIncome: 380000000, eps: 1.85 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-10', revenue: 2650000000, netIncome: 350000000, eps: 1.70 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-11', revenue: 2500000000, netIncome: 320000000, eps: 1.55 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-10', revenue: 2380000000, netIncome: 300000000, eps: 1.46 },
  ],
  OKTA: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-05', revenue: 665000000, netIncome: 44000000, eps: 0.27 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-05', revenue: 625000000, netIncome: 38000000, eps: 0.23 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-05', revenue: 590000000, netIncome: 32000000, eps: 0.20 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-05', revenue: 555000000, netIncome: 28000000, eps: 0.17 },
  ],
  PANW: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-08-19', revenue: 2189000000, netIncome: 391000000, eps: 4.27 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-05-20', revenue: 2086000000, netIncome: 368000000, eps: 4.03 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-02-18', revenue: 1985000000, netIncome: 340000000, eps: 3.74 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-11-18', revenue: 1886000000, netIncome: 319000000, eps: 3.52 },
  ],
  PLTR: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-11-05', revenue: 726000000, netIncome: 126000000, eps: 0.05 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-08-05', revenue: 678000000, netIncome: 111000000, eps: 0.04 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-05-06', revenue: 635000000, netIncome: 98000000, eps: 0.04 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 637000000, netIncome: 98000000, eps: 0.04 },
  ],
  ROKU: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-10-16', revenue: 1049000000, netIncome: 67000000, eps: 0.41 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-07-17', revenue: 1021000000, netIncome: 59000000, eps: 0.36 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-04-24', revenue: 968000000, netIncome: 46000000, eps: 0.28 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 1265000000, netIncome: 98000000, eps: 0.62 },
  ],
  TXN: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-10-21', revenue: 4110000000, netIncome: 1310000000, eps: 1.47 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-07-22', revenue: 3940000000, netIncome: 1230000000, eps: 1.38 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-04-22', revenue: 3730000000, netIncome: 1140000000, eps: 1.28 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-31', revenue: 3890000000, netIncome: 1230000000, eps: 1.38 },
  ],
  ZS: [
    { fiscalYear: 2025, fiscalQuarter: 3, reportDate: '2025-09-05', revenue: 602000000, netIncome: 43000000, eps: 0.27 },
    { fiscalYear: 2025, fiscalQuarter: 2, reportDate: '2025-06-05', revenue: 567000000, netIncome: 37000000, eps: 0.23 },
    { fiscalYear: 2025, fiscalQuarter: 1, reportDate: '2025-03-05', revenue: 535000000, netIncome: 32000000, eps: 0.20 },
    { fiscalYear: 2024, fiscalQuarter: 4, reportDate: '2024-12-05', revenue: 505000000, netIncome: 28000000, eps: 0.17 },
  ],
}

async function seedMissingEarnings() {
  console.log('=== Seeding Missing Earnings Data ===\n')
  
  let totalInserted = 0
  let totalErrors = 0
  
  for (const symbol of MISSING_SYMBOLS) {
    console.log(`Processing ${symbol}...`)
    
    // Get company ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('symbol', symbol)
      .single()
    
    if (companyError || !company) {
      console.log(`  ✗ Company not found`)
      totalErrors++
      continue
    }
    
    const earnings = SAMPLE_EARNINGS[symbol] || []
    
    for (const data of earnings) {
      const { error } = await supabase
        .from('earnings')
        .upsert(
          {
            company_id: company.id,
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
        console.log(`  ✗ Error: ${error.message}`)
        totalErrors++
      } else {
        console.log(`  ✓ FY${data.fiscalYear} Q${data.fiscalQuarter}`)
        totalInserted++
      }
    }
    
    console.log('')
  }
  
  console.log('=== Summary ===')
  console.log(`Inserted: ${totalInserted}`)
  console.log(`Errors: ${totalErrors}`)
  
  return { inserted: totalInserted, errors: totalErrors }
}

seedMissingEarnings()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
