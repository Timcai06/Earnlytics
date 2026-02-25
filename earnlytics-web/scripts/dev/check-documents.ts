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
  const { data, error } = await supabase
    .from('earnings_documents')
    .select('id, earnings_id, content, document_type')
    .limit(10)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Total documents:', data?.length || 0)
  data?.forEach((doc, i) => {
    console.log(`${i + 1}. ID: ${doc.id}, earnings_id: ${doc.earnings_id}, type: ${doc.document_type}`)
    console.log('   content:', doc.content ? JSON.stringify(Object.keys(doc.content)) : 'NULL')
  })
}

check()
