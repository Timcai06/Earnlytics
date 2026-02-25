import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, fiscal_year, fiscal_quarter, revenue, is_analyzed')
    .in('id', [138, 139, 140, 141, 1])
    .order('fiscal_year', { ascending: false })

  console.log('Earnings records:')
  earnings?.forEach(e => {
    console.log('  ID:', e.id, '| FY' + e.fiscal_year, 'Q' + e.fiscal_quarter, '| revenue:', e.revenue, '| analyzed:', e.is_analyzed)
  })
}

check()
