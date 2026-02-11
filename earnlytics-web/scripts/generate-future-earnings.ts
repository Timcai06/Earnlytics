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

const companies = [
  { symbol: 'AAPL', name: 'Apple Inc.', q1: '02-01', q2: '05-02', q3: '08-01', q4: '11-01' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', q1: '01-25', q2: '04-25', q3: '07-25', q4: '10-24' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', q1: '04-25', q2: '07-23', q3: '10-22', q4: '01-30' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', q1: '02-26', q2: '05-22', q3: '08-28', q4: '11-20' },
  { symbol: 'META', name: 'Meta Platforms Inc.', q1: '04-24', q2: '07-24', q3: '10-23', q4: '01-29' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', q1: '04-30', q2: '08-01', q3: '10-31', q4: '02-01' },
  { symbol: 'TSLA', name: 'Tesla Inc.', q1: '04-23', q2: '07-23', q3: '10-23', q4: '01-25' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', q1: '04-30', q2: '07-30', q3: '10-29', q4: '01-28' },
  { symbol: 'NFLX', name: 'Netflix Inc.', q1: '04-18', q2: '07-18', q3: '10-17', q4: '01-21' },
  { symbol: 'CRM', name: 'Salesforce Inc.', q1: '05-29', q2: '08-28', q3: '12-03', q4: '02-26' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', q1: '03-07', q2: '06-06', q3: '09-05', q4: '12-12' },
  { symbol: 'ORCL', name: 'Oracle Corporation', q1: '03-10', q2: '06-09', q3: '09-08', q4: '12-09' },
  { symbol: 'ADBE', name: 'Adobe Inc.', q1: '03-12', q2: '06-11', q3: '09-10', q4: '12-11' },
  { symbol: 'IBM', name: 'IBM', q1: '04-24', q2: '07-24', q3: '10-23', q4: '01-29' },
  { symbol: 'INTC', name: 'Intel Corporation', q1: '04-25', q2: '07-25', q3: '10-24', q4: '01-23' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', q1: '05-01', q2: '07-31', q3: '11-06', q4: '02-05' },
  { symbol: 'TXN', name: 'Texas Instruments', q1: '04-23', q2: '07-23', q3: '10-22', q4: '01-21' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', q1: '04-24', q2: '07-24', q3: '10-23', q4: '01-22' },
  { symbol: 'PANW', name: 'Palo Alto Networks', q1: '02-20', q2: '05-20', q3: '08-19', q4: '11-18' },
  { symbol: 'PLTR', name: 'Palantir Technologies', q1: '05-06', q2: '08-05', q3: '11-04', q4: '02-11' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', q1: '05-22', q2: '08-21', q3: '11-20', q4: '02-26' },
  { symbol: 'CRWD', name: 'CrowdStrike', q1: '03-05', q2: '06-04', q3: '09-03', q4: '12-03' },
  { symbol: 'DDOG', name: 'Datadog', q1: '05-07', q2: '08-06', q3: '11-05', q4: '02-13' },
  { symbol: 'NET', name: 'Cloudflare', q1: '05-02', q2: '08-01', q3: '10-31', q4: '02-06' },
  { symbol: 'MDB', name: 'MongoDB', q1: '06-05', q2: '09-04', q3: '12-04', q4: '03-05' },
  { symbol: 'ZS', name: 'Zscaler', q1: '02-27', q2: '05-28', q3: '08-27', q4: '11-26' },
  { symbol: 'OKTA', name: 'Okta', q1: '05-29', q2: '08-28', q3: '11-27', q4: '02-26' },
  { symbol: 'DOCU', name: 'DocuSign', q1: '06-06', q2: '09-05', q3: '12-05', q4: '03-06' },
  { symbol: 'ROKU', name: 'Roku', q1: '04-25', q2: '07-25', q3: '10-24', q4: '02-13' },
  { symbol: 'UBER', name: 'Uber', q1: '05-07', q2: '08-06', q3: '11-05', q4: '02-05' },
]

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

async function upsertFutureEarning(
  companyId: number,
  fiscalYear: number,
  fiscalQuarter: number,
  reportDate: string
) {
  const { error } = await supabase
    .from('earnings')
    .upsert(
      {
        company_id: companyId,
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        report_date: reportDate,
        is_analyzed: false,
      },
      {
        onConflict: 'company_id,fiscal_year,fiscal_quarter',
      }
    )
  
  if (error) {
    console.error('Error upserting:', error)
    return false
  }
  
  return true
}

async function generateFutureEarnings() {
  console.log('=== Generating Future Earnings Calendar ===\n')
  
  const currentYear = 2026
  const currentMonth = 2
  
  let addedCount = 0
  let skippedCount = 0
  
  for (const company of companies) {
    const companyId = await getCompanyId(company.symbol)
    if (!companyId) {
      console.log(`  Skipping ${company.symbol}: Company not found`)
      skippedCount++
      continue
    }
    
    const quarters = [
      { q: 1, date: `${currentYear}-${company.q1}`, fiscalYear: currentYear },
      { q: 2, date: `${currentYear}-${company.q2}`, fiscalYear: currentYear },
      { q: 3, date: `${currentYear}-${company.q3}`, fiscalYear: currentYear },
      { q: 4, date: `${currentYear + 1}-${company.q4}`, fiscalYear: currentYear + 1 },
    ]
    
    for (const quarter of quarters) {
      const qDate = new Date(quarter.date)
      
      if (qDate.getMonth() + 1 >= currentMonth - 1) {
        const success = await upsertFutureEarning(
          companyId,
          quarter.fiscalYear,
          quarter.q,
          quarter.date
        )
        
        if (success) {
          console.log(`  ✓ ${company.symbol} Q${quarter.q} FY${quarter.fiscalYear} - ${quarter.date}`)
          addedCount++
        }
      }
    }
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Added/Updated: ${addedCount} future earnings`)
  console.log(`Skipped: ${skippedCount} companies`)
}

generateFutureEarnings()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
