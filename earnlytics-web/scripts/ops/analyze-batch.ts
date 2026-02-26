import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { analyzeEarnings } from '../../src/lib/ai'
import type { EarningWithCompany } from '../../src/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getUnanalyzedEarnings(limit: number = 5): Promise<EarningWithCompany[]> {
  const { data, error } = await supabase
    .from('earnings')
    .select(`
      *,
      companies (*)
    `)
    .eq('is_analyzed', false)
    .order('report_date', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching unanalyzed earnings:', error)
    return []
  }
  
  return data || []
}

async function saveAnalysis(
  earningsId: number,
  result: {
    summary: string
    highlights: string[]
    concerns: string[]
    sentiment: string
  },
  tokensUsed: number,
  costUsd: number
) {
  const { error: analysisError } = await supabase
    .from('ai_analyses')
    .upsert(
      {
        earnings_id: earningsId,
        summary: result.summary,
        highlights: result.highlights,
        concerns: result.concerns,
        sentiment: result.sentiment,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
      },
      {
        onConflict: 'earnings_id',
      }
    )
  
  if (analysisError) {
    console.error('Error saving analysis:', analysisError)
    return false
  }
  
  const { error: updateError } = await supabase
    .from('earnings')
    .update({ is_analyzed: true })
    .eq('id', earningsId)
  
  if (updateError) {
    console.error('Error updating earnings status:', updateError)
    return false
  }
  
  return true
}

async function analyzeBatch() {
  console.log('Starting batch analysis...')
  
  const unanalyzed = await getUnanalyzedEarnings(5)
  
  if (unanalyzed.length === 0) {
    console.log('No unanalyzed earnings found.')
    return { analyzed: 0, totalCost: 0 }
  }
  
  console.log(`Found ${unanalyzed.length} earnings to analyze`)
  
  let analyzedCount = 0
  let totalCost = 0
  const errors: string[] = []
  
  for (const earning of unanalyzed) {
    try {
      const company = earning.companies
      console.log(`Analyzing ${company.symbol} FY${earning.fiscal_year} Q${earning.fiscal_quarter}...`)
      
      const { result, tokensUsed, costUsd } = await analyzeEarnings(earning)
      
      const success = await saveAnalysis(
        earning.id,
        result,
        tokensUsed,
        costUsd
      )
      
      if (success) {
        analyzedCount++
        totalCost += costUsd
        console.log(`  ✓ Analysis saved (${tokensUsed} tokens, $${costUsd.toFixed(6)})`)
        console.log(`  Sentiment: ${result.sentiment}`)
      } else {
        errors.push(`${company.symbol}: Failed to save analysis`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`  ✗ Error analyzing ${earning.companies.symbol}:`, errorMessage)
      errors.push(`${earning.companies.symbol}: ${errorMessage}`)
    }
  }
  
  console.log('\n=== Analysis Summary ===')
  console.log(`Analyzed: ${analyzedCount}/${unanalyzed.length}`)
  console.log(`Total cost: $${totalCost.toFixed(6)} USD`)
  console.log(`Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
  
  return { analyzed: analyzedCount, totalCost, errors }
}

analyzeBatch()
  .then(result => {
    console.log('\nDone!')
    process.exit(result.errors && result.errors.length > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
