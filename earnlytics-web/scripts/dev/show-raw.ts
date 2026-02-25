import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkRaw() {
  const { data: doc } = await supabase
    .from('earnings_documents')
    .select('content, raw_html_url, document_type')
    .eq('earnings_id', 141)
    .single()

  if (!doc) {
    console.log('No document found')
    return
  }

  console.log('Document type:', doc.document_type)
  console.log('URL:', doc.raw_html_url)
  console.log('\n=== FULL MD&A (前3000字符) ===\n')
  const content = doc.content as any
  console.log(content.mdAndA?.substring(0, 3000) || 'Empty')
  
  console.log('\n\n=== GUIDANCE (完整) ===\n')
  console.log(content.guidance || 'Empty')
}

checkRaw()
