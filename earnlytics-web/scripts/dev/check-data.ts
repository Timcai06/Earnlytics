import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkData() {
  const { count: companiesCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
  
  const { count: earningsCount } = await supabase
    .from('earnings')
    .select('*', { count: 'exact', head: true })
  
  const { count: analyzedCount } = await supabase
    .from('earnings')
    .select('*', { count: 'exact', head: true })
    .eq('is_analyzed', true)
  
  const { count: unanalyzedCount } = await supabase
    .from('earnings')
    .select('*', { count: 'exact', head: true })
    .eq('is_analyzed', false)
  
  console.log('\n========================================')
  console.log('Database Status Check')
  console.log('========================================')
  console.log(`Total companies: ${companiesCount}`)
  console.log(`Total earnings: ${earningsCount}`)
  console.log(`Analyzed: ${analyzedCount}`)
  console.log(`Unanalyzed: ${unanalyzedCount}`)
  console.log('========================================\n')
}

checkData().then(() => process.exit(0))
