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

const tier3Companies = [
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: '云计算', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Snowflake_Logo.svg' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: '网络安全', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/CrowdStrike_logo.svg' },
  { symbol: 'DDOG', name: 'Datadog Inc.', sector: '监控', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Datadog_logo.svg' },
  { symbol: 'NET', name: 'Cloudflare Inc.', sector: '网络安全', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Cloudflare_Logo.svg' },
  { symbol: 'MDB', name: 'MongoDB Inc.', sector: '数据库', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/MongoDB_Logo.svg' },
  { symbol: 'ZS', name: 'Zscaler Inc.', sector: '网络安全', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Zscaler_Logo.svg' },
  { symbol: 'OKTA', name: 'Okta Inc.', sector: '身份认证', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Okta_logo.svg' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', sector: '电子签名', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/DocuSign_logo.svg' },
  { symbol: 'ROKU', name: 'Roku Inc.', sector: '流媒体', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Roku_Logo.svg' },
  { symbol: 'UBER', name: 'Uber Technologies', sector: '共享出行', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Uber_Logo_2018.svg' },
]

async function insertTier3Companies() {
  console.log('========================================')
  console.log('Inserting Tier 3 Companies')
  console.log('========================================\n')
  
  let insertedCount = 0
  let skippedCount = 0
  let errors: string[] = []
  
  for (const company of tier3Companies) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .upsert(company, { onConflict: 'symbol' })
        .select()
      
      if (error) {
        console.log(`  ✗ ${company.symbol}: ${error.message}`)
        errors.push(`${company.symbol}: ${error.message}`)
      } else {
        console.log(`  ✓ ${company.symbol}: ${company.name}`)
        insertedCount++
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log(`  ✗ ${company.symbol}: ${errorMessage}`)
      errors.push(`${company.symbol}: ${errorMessage}`)
    }
  }
  
  console.log('\n========================================')
  console.log('Insertion Summary')
  console.log('========================================')
  console.log(`Inserted: ${insertedCount}/${tier3Companies.length}`)
  console.log(`Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
  
  return { insertedCount, errors }
}

insertTier3Companies()
  .then(result => {
    console.log('\nDone!')
    process.exit(result.errors.length > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
