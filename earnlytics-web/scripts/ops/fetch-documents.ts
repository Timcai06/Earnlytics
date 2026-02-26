import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { fetchLatestFiling } from '../../src/lib/sec-edgar/fetch-document'
import { COMPANY_CIK_MAP } from '../../src/lib/sec-edgar/cik-map'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getCIK(symbol: string): Promise<string | null> {
  return COMPANY_CIK_MAP[symbol]?.cik || null
}

async function saveDocumentToDB(
  earningsId: number,
  symbol: string,
  parsedDoc: {
    source: string
    documentType: string
    filingDate: string
    content: unknown
    rawHtmlUrl: string
    rawText?: string
  }
) {
  try {
    const { error } = await supabase
      .from('earnings_documents')
      .upsert(
        {
          earnings_id: earningsId,
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
      console.error(`    ✗ Error saving document:`, error)
      return false
    }
    
    console.log(`    ✓ Document saved successfully`)
    return true
  } catch (error) {
    console.error(`    ✗ Error:`, error)
    return false
  }
}

async function processEarnings(symbol: string) {
  console.log(`\nProcessing ${symbol}...`)
  
  const cik = await getCIK(symbol)
  if (!cik) {
    console.warn(`  ⚠ No CIK found for ${symbol}`)
    return { saved: 0, skipped: 0, errors: 1 }
  }
  
  const { data: companyData } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()
  
  if (!companyData) {
    console.warn(`  ⚠ Company not found: ${symbol}`)
    return { saved: 0, skipped: 0, errors: 1 }
  }
  
  const { data: earnings } = await supabase
    .from('earnings')
    .select('id, fiscal_year, fiscal_quarter, report_date')
    .eq('company_id', companyData.id)
    .order('fiscal_year', { ascending: false })
    .order('fiscal_quarter', { ascending: false })
    .limit(4)
  
  if (!earnings || earnings.length === 0) {
    console.warn(`  ⚠ No earnings found for ${symbol}`)
    return { saved: 0, skipped: 0, errors: 0 }
  }
  
  let saved = 0
  let skipped = 0
  let errors = 0
  
  for (const earning of earnings) {
    console.log(`  FY${earning.fiscal_year} Q${earning.fiscal_quarter} (${earning.report_date})`)
    
    const { data: existingDoc } = await supabase
      .from('earnings_documents')
      .select('id')
      .eq('earnings_id', earning.id)
      .single()
    
    if (existingDoc) {
      console.log(`    → Document already exists, skipping`)
      skipped++
      continue
    }
    
    const formType = earning.fiscal_quarter === 4 ? '10-K' : '10-Q'
    const parsedDoc = await fetchLatestFiling(symbol, formType)
    
    if (!parsedDoc) {
      console.warn(`    ⚠ No ${formType} filing found`)
      errors++
      continue
    }
    
    const success = await saveDocumentToDB(earning.id, symbol, parsedDoc)
    if (success) {
      saved++
    } else {
      errors++
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return { saved, skipped, errors }
}

async function main() {
  const symbols = process.argv.slice(2)
  
  if (symbols.length === 0) {
    console.log('Usage: npx tsx scripts/fetch-documents.ts <SYMBOL1> [SYMBOL2] ...')
    console.log('Example: npx tsx scripts/fetch-documents.ts AAPL MSFT AMZN')
    process.exit(1)
  }
  
  console.log('========================================')
  console.log('Fetch SEC Documents')
  console.log('========================================')
  console.log(`Symbols: ${symbols.join(', ')}`)
  console.log('')
  
  let totalSaved = 0
  let totalSkipped = 0
  let totalErrors = 0
  
  for (const symbol of symbols) {
    const result = await processEarnings(symbol)
    totalSaved += result.saved
    totalSkipped += result.skipped
    totalErrors += result.errors
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n========================================')
  console.log('Complete')
  console.log('========================================')
  console.log(`Saved: ${totalSaved}`)
  console.log(`Skipped (already exists): ${totalSkipped}`)
  console.log(`Errors: ${totalErrors}`)
  console.log('')
}

main()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
