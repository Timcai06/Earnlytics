import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateDataSources() {
  console.log('Updating data sources for existing earnings...')

  // Tier 1 companies - FMP API
  const tier1Symbols = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'AMZN', 'TSLA', 'AMD', 'NFLX', 'CRM']

  // Tier 2 companies - mostly sample data (backfilled)
  const tier2Symbols = ['AVGO', 'ORCL', 'ADBE', 'IBM', 'INTC', 'QCOM', 'TXN', 'NOW', 'PANW', 'PLTR']

  // Tier 3 companies - SEC EDGAR + some sample
  const tier3Symbols = ['SNOW', 'CRWD', 'DDOG', 'NET', 'MDB', 'ZS', 'OKTA', 'DOCU', 'ROKU', 'UBER']

  try {
    // Get all earnings with their company symbols
    const { data: earnings, error } = await supabase
      .from('earnings')
      .select(`
        id,
        companies!inner(symbol)
      `)

    if (error) {
      console.error('Error fetching earnings:', error)
      return
    }

    if (!earnings || earnings.length === 0) {
      console.log('No earnings found')
      return
    }

    console.log(`Found ${earnings.length} earnings to update`)

    let updated = 0
    let fmpCount = 0
    let secCount = 0
    let sampleCount = 0

    for (const earning of earnings) {
      const companies = earning.companies as { symbol: string }[]
      const symbol = companies[0]?.symbol
      let dataSource: 'fmp' | 'sec' | 'sample'

      if (tier1Symbols.includes(symbol)) {
        dataSource = 'fmp'
        fmpCount++
      } else if (tier3Symbols.includes(symbol)) {
        dataSource = 'sec'
        secCount++
      } else {
        dataSource = 'sample'
        sampleCount++
      }

      const { error: updateError } = await supabase
        .from('earnings')
        .update({ data_source: dataSource })
        .eq('id', earning.id)

      if (updateError) {
        console.error(`Error updating earning ${earning.id}:`, updateError)
      } else {
        updated++
      }
    }

    console.log('\n=== Update Summary ===')
    console.log(`Total earnings: ${earnings.length}`)
    console.log(`Updated: ${updated}`)
    console.log(`FMP API: ${fmpCount}`)
    console.log(`SEC EDGAR: ${secCount}`)
    console.log(`Sample data: ${sampleCount}`)

  } catch (error) {
    console.error('Error:', error)
  }
}

updateDataSources()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
