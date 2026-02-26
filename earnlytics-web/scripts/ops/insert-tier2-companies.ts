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

const tier2Companies = [
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: '芯片', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Broadcom_Ltd._logo.svg' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: '软件', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: '软件', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg' },
  { symbol: 'IBM', name: 'International Business Machines', sector: '企业服务', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: '芯片', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: '芯片', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Qualcomm_logo.svg' },
  { symbol: 'TXN', name: 'Texas Instruments', sector: '芯片', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Texas_Instruments_logo.svg' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', sector: '软件', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/ServiceNow_logo.svg' },
  { symbol: 'PANW', name: 'Palo Alto Networks', sector: '网络安全', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Palo_Alto_Networks_logo.svg' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: '数据分析', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Palantir_Technologies_logo.svg' },
]

async function insertTier2Companies() {
  console.log('Inserting Tier 2 companies...\n')
  
  let insertedCount = 0
  const errors: string[] = []
  
  for (const company of tier2Companies) {
    try {
      const { error } = await supabase
        .from('companies')
        .upsert(company, { onConflict: 'symbol' })
        .select()
      
      if (error) {
        console.error(`  ✗ Error inserting ${company.symbol}:`, error.message)
        errors.push(`${company.symbol}: ${error.message}`)
      } else {
        console.log(`  ✓ Inserted: ${company.symbol} - ${company.name}`)
        insertedCount++
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`  ✗ Error inserting ${company.symbol}:`, errorMessage)
      errors.push(`${company.symbol}: ${errorMessage}`)
    }
  }
  
  console.log('\n========================================')
  console.log('Insertion Summary')
  console.log('========================================')
  console.log(`Companies inserted: ${insertedCount}/${tier2Companies.length}`)
  console.log(`Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
  
  return { insertedCount, errors }
}

insertTier2Companies()
  .then(result => {
    console.log('\nDone!')
    process.exit(result.errors.length > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
