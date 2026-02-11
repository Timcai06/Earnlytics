import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCompanyEarnings() {
  console.log('=== Checking Company Earnings Status ===\n')
  
  // Get all companies
  const { data: companies } = await supabase
    .from('companies')
    .select('id, symbol, name')
    .order('symbol')
  
  if (!companies) {
    console.log('No companies found')
    return
  }
  
  // Get earnings with company info
  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, company_id, fiscal_year, fiscal_quarter, report_date, is_analyzed, companies!inner(symbol)')
  
  // Create a map of company_id -> earnings count
  const earningsByCompany = new Map<number, typeof earnings>()
  
  earnings?.forEach(e => {
    const existing = earningsByCompany.get(e.company_id) || []
    existing.push(e)
    earningsByCompany.set(e.company_id, existing)
  })
  
  console.log(`Total companies: ${companies.length}`)
  console.log(`Total earnings: ${earnings?.length || 0}\n`)
  
  // Find companies without earnings
  const companiesWithoutEarnings = companies.filter(c => {
    const count = earningsByCompany.get(c.id)?.length || 0
    return count === 0
  })
  
  const companiesWithEarnings = companies.filter(c => {
    const count = earningsByCompany.get(c.id)?.length || 0
    return count > 0
  })
  
  console.log('=== Companies WITH earnings ===')
  companiesWithEarnings.forEach(c => {
    const count = earningsByCompany.get(c.id)?.length || 0
    console.log(`  ${c.symbol}: ${count} earnings`)
  })
  
  console.log('\n=== Companies WITHOUT earnings ===')
  if (companiesWithoutEarnings.length === 0) {
    console.log('  All companies have at least one earning!')
  } else {
    companiesWithoutEarnings.forEach(c => {
      console.log(`  ${c.symbol}: ${c.name}`)
    })
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`With earnings: ${companiesWithEarnings.length}`)
  console.log(`Without earnings: ${companiesWithoutEarnings.length}`)
}

checkCompanyEarnings()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
