import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { fetchLatestFiling } from '../src/lib/sec-edgar/fetch-document'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateDocuments(symbol: string) {
  console.log(`\nUpdating documents for ${symbol}...`)

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()

  if (!company) {
    console.warn(`Company not found: ${symbol}`)
    return
  }

  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, fiscal_year, fiscal_quarter')
    .eq('company_id', company.id)
    .order('fiscal_year', { ascending: false })
    .order('fiscal_quarter', { ascending: false })
    .limit(4)

  for (const earning of earnings || []) {
    console.log(`  FY${earning.fiscal_year} Q${earning.fiscal_quarter}`)

    const formType = earning.fiscal_quarter === 4 ? '10-K' : '10-Q'
    const parsedDoc = await fetchLatestFiling(symbol, formType)

    if (!parsedDoc) {
      console.warn(`    No filing found`)
      continue
    }

    const content = parsedDoc.content as any
    console.log(`    Extracted:`, {
      highlights: content.financialHighlights?.length || 0,
      mdAndA: content.mdAndA?.length || 0,
      risks: content.riskFactors?.length || 0,
      guidance: content.guidance?.length || 0
    })

    const { error } = await supabase
      .from('earnings_documents')
      .upsert(
        {
          earnings_id: earning.id,
          source: parsedDoc.source,
          document_type: parsedDoc.documentType,
          filing_date: parsedDoc.filingDate,
          content: parsedDoc.content,
          source_url: parsedDoc.rawHtmlUrl,
          raw_html_url: parsedDoc.rawHtmlUrl,
          language: 'en',
          word_count: parsedDoc.rawText?.split(/\s+/).length || 0,
        },
        { onConflict: 'earnings_id' }
      )

    if (error) {
      console.error(`    Error:`, error.message)
    } else {
      console.log(`    Saved successfully`)
    }

    await new Promise(r => setTimeout(r, 1000))
  }
}

updateDocuments('AAPL').then(() => {
  console.log('\nDone!')
  process.exit(0)
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
