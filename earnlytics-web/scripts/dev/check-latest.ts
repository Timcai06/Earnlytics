import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', 'AAPL')
    .single()

  console.log('Company ID:', company?.id)

  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, fiscal_year, fiscal_quarter, report_date, revenue')
    .eq('company_id', company?.id)
    .not('revenue', 'is', null)
    .order('fiscal_year', { ascending: false })
    .order('fiscal_quarter', { ascending: false })
    .limit(1)
    .single()

  console.log('Latest earnings:', earnings)
}

check()
