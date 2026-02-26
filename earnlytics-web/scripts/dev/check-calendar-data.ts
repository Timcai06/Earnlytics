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

type CompanyRef = { symbol?: string } | { symbol?: string }[] | null

async function checkCalendarData() {
  console.log('=== Checking Calendar Data ===\n')

  // Get all earnings with dates
  const { data: earnings, error } = await supabase
    .from('earnings')
    .select(`
      id,
      report_date,
      fiscal_year,
      fiscal_quarter,
      companies (symbol, name)
    `)
    .order('report_date', { ascending: false })

  if (error) {
    console.error('Error fetching earnings:', error)
    return
  }

  if (!earnings || earnings.length === 0) {
    console.log('No earnings data found!')
    return
  }

  console.log(`Total earnings in database: ${earnings.length}\n`)

  // Group by year-month
  const byMonth: Record<string, number> = {}
  const recentDates = earnings.slice(0, 20)

  earnings.forEach(e => {
    const date = new Date(e.report_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] || 0) + 1
  })

  console.log('Earnings by month (latest 12 months):')
  Object.entries(byMonth)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .forEach(([month, count]) => {
      console.log(`  ${month}: ${count} earnings`)
    })

  console.log('\nMost recent 20 earnings:')
  recentDates.forEach(e => {
    const companies = e.companies as CompanyRef
    const company = Array.isArray(companies)
      ? companies[0]?.symbol || 'Unknown'
      : companies?.symbol || 'Unknown'
    console.log(`  ${e.report_date} - ${company} Q${e.fiscal_quarter} FY${e.fiscal_year}`)
  })

  // Check current month
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentMonthCount = byMonth[currentMonthKey] || 0
  console.log(`\nCurrent month (${currentMonthKey}): ${currentMonthCount} earnings`)

  if (currentMonthCount === 0) {
    console.log('\n⚠️  WARNING: No earnings data for current month!')
    console.log('The calendar will appear empty.')
  }
}

checkCalendarData()
  .then(() => {
    console.log('\n=== Done ===')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
