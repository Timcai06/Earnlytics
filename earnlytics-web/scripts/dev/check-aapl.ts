import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing env vars')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: company } = await supabase
    .from('companies')
    .select('id, symbol')
    .eq('symbol', 'AAPL')
    .single()
  
  console.log('AAPL company_id:', company?.id)
  
  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, fiscal_year, fiscal_quarter, report_date')
    .eq('company_id', company?.id)
    .order('fiscal_year', { ascending: false })
    .order('fiscal_quarter', { ascending: false })
    .limit(5)
  
  console.log('AAPL earnings:')
  earnings?.forEach(e => {
    console.log('  ID:', e.id, '| FY' + e.fiscal_year, 'Q' + e.fiscal_quarter, '|', e.report_date)
  })
}

check()
