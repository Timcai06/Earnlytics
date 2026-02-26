import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DocumentContent {
  financialHighlights?: string
  mdAndA?: string
  riskFactors?: string[] | string
  guidance?: string
}

async function check() {
  const { data: doc } = await supabase
    .from('earnings_documents')
    .select('content, earnings_id')
    .eq('earnings_id', 141)
    .single()

  if (!doc?.content) {
    console.log('No content found')
    return
  }

  const content = doc.content as DocumentContent
  
  console.log('Content keys:', Object.keys(content))
  console.log('\n=== Financial Highlights (length):', content.financialHighlights?.length || 0)
  console.log('Preview:', content.financialHighlights?.substring(0, 200))
  
  console.log('\n=== MD&A (length):', content.mdAndA?.length || 0)
  console.log('Preview:', content.mdAndA?.substring(0, 200))
  
  console.log('\n=== Risk Factors (type):', typeof content.riskFactors, Array.isArray(content.riskFactors))
  console.log('Count:', Array.isArray(content.riskFactors) ? content.riskFactors.length : 0)
  if (Array.isArray(content.riskFactors)) {
    content.riskFactors.forEach((r: string, i: number) => {
      console.log(`  ${i + 1}. (${r.length} chars): ${r.substring(0, 100)}...`)
    })
  } else {
    console.log('Preview:', String(content.riskFactors).substring(0, 200))
  }
  
  console.log('\n=== Guidance (length):', content.guidance?.length || 0)
  console.log('Preview:', content.guidance?.substring(0, 200))
}

check()
