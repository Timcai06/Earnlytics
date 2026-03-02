/**
 * Process Alert Rules Script
 *
 * This script evaluates all active alert rules against current market data
 * and creates alerts when conditions are met.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { evaluateRulesForSymbol } from '../../src/lib/alerts/engine'
import { sendAlertNotification } from '../../src/lib/alerts/notifications'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CompanyData {
  symbol: string
  currentPrice: number
  previousPrice: number
  peRatio: number
  pePercentile: number
  rating: string
  previousRating: string
  targetPrice: number
  previousTargetPrice: number
  earningsDate?: string
}

function mapSentimentToRating(sentiment: string | null | undefined): string {
  if (sentiment === 'positive') return 'buy'
  if (sentiment === 'negative') return 'sell'
  return 'hold'
}

function pickSentimentFromEarning(
  earning: { ai_analyses?: unknown } | undefined
): string | undefined {
  const analyses = earning?.ai_analyses
  if (Array.isArray(analyses)) {
    const first = analyses[0] as { sentiment?: string | null } | undefined
    return first?.sentiment || undefined
  }
  if (analyses && typeof analyses === 'object') {
    return (analyses as { sentiment?: string | null }).sentiment || undefined
  }
  return undefined
}

async function fetchCompanyData(symbol: string): Promise<CompanyData | null> {
  const { data: company } = await supabase
    .from('companies')
    .select('id, symbol')
    .eq('symbol', symbol)
    .maybeSingle()

  if (!company) {
    return null
  }

  const today = new Date().toISOString().split('T')[0]

  const [{ data: valuation }, { data: priceRows }, { data: latestEarnings }, { data: upcomingEarning }] =
    await Promise.all([
      supabase
        .from('company_valuation')
        .select('pe_ratio')
        .eq('company_id', company.id)
        .maybeSingle(),
      supabase
        .from('stock_prices')
        .select('price')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(2),
      supabase
        .from('earnings')
        .select('id, ai_analyses(sentiment)')
        .eq('company_id', company.id)
        .order('report_date', { ascending: false })
        .limit(2),
      supabase
        .from('earnings')
        .select('report_date')
        .eq('company_id', company.id)
        .gte('report_date', today)
        .order('report_date', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ])

  const currentPrice = priceRows?.[0]?.price || 0
  const previousPrice = priceRows?.[1]?.price || currentPrice

  const latestSentiment = pickSentimentFromEarning(latestEarnings?.[0])
  const previousSentiment = pickSentimentFromEarning(latestEarnings?.[1])

  // If no price and valuation data, skip this symbol.
  if (!currentPrice && !valuation?.pe_ratio) {
    return null
  }

  return {
    symbol,
    currentPrice,
    previousPrice,
    peRatio: valuation?.pe_ratio || 0,
    pePercentile: 50,
    rating: mapSentimentToRating(latestSentiment),
    previousRating: mapSentimentToRating(previousSentiment),
    targetPrice: currentPrice,
    previousTargetPrice: previousPrice,
    earningsDate: upcomingEarning?.report_date || undefined,
  }
}

async function incrementRuleCounter(ruleId: string) {
  const { data: currentRule } = await supabase
    .from('alert_rules')
    .select('trigger_count')
    .eq('id', ruleId)
    .maybeSingle()

  const nextCount = (currentRule?.trigger_count || 0) + 1
  await supabase
    .from('alert_rules')
    .update({
      last_triggered_at: new Date().toISOString(),
      trigger_count: nextCount,
    })
    .eq('id', ruleId)
}

async function resolveAuthEmail(authUserId: string): Promise<{ email: string; name?: string } | null> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(authUserId)
    if (error || !data?.user?.email) {
      return null
    }
    return {
      email: data.user.email,
      name:
        (typeof data.user.user_metadata?.name === 'string' ? data.user.user_metadata.name : undefined) ||
        (typeof data.user.user_metadata?.full_name === 'string' ? data.user.user_metadata.full_name : undefined),
    }
  } catch (error) {
    console.error(`Failed to resolve auth email for ${authUserId}:`, error)
    return null
  }
}

async function processAlerts() {
  console.log('🚀 Starting alert processing...')
  const startTime = Date.now()

  try {
    // Get all unique symbols that have active rules
    const { data: rules } = await supabase
      .from('alert_rules')
      .select('symbol')
      .eq('is_active', true)
      .not('symbol', 'is', null)

    const symbols = [...new Set((rules || []).map((r) => r.symbol).filter(Boolean))]
    console.log(`📊 Processing alerts for ${symbols.length} symbols`)

    let totalAlertsCreated = 0
    let totalNotificationsSent = 0

    for (const symbol of symbols) {
      console.log(`\n🔍 Processing ${symbol}...`)

      // Fetch current company data
      const companyData = await fetchCompanyData(symbol as string)
      if (!companyData) {
        console.log(`  ⚠️ No data found for ${symbol}`)
        continue
      }

      // Evaluate rules for this symbol
      const context = {
        symbol: companyData.symbol,
        currentPrice: companyData.currentPrice,
        previousPrice: companyData.previousPrice,
        peRatio: companyData.peRatio,
        pePercentile: companyData.pePercentile,
        currentRating: companyData.rating,
        previousRating: companyData.previousRating,
        targetPrice: companyData.targetPrice,
        previousTargetPrice: companyData.previousTargetPrice,
        earningsDate: companyData.earningsDate,
      }

      const triggeredRules = await evaluateRulesForSymbol(companyData.symbol, context)
      console.log(`  ✅ ${triggeredRules.length} rules triggered`)

      for (const { rule, result } of triggeredRules) {
        if (!result.triggered || !result.title || !result.message) {
          continue
        }

        if (!rule.userId) {
          console.warn(`  ⚠️ Skip alert ${rule.id}: missing userId`)
          continue
        }

        // Create alert in database
        const { data: alert, error: alertError } = await supabase
          .from('alert_history')
          .insert({
            rule_id: rule.id,
            user_id: rule.userId,
            symbol: companyData.symbol,
            alert_type: rule.ruleType,
            title: result.title,
            message: result.message,
            data: result.data || {},
            priority: result.priority || 'medium',
          })
          .select()
          .single()

        if (alertError) {
          console.error(`  ❌ Failed to create alert: ${alertError.message}`)
          continue
        }

        totalAlertsCreated++
        console.log(`  🔔 Alert created: ${alert.id}`)

        await incrementRuleCounter(rule.id)

        const userIdentity = await resolveAuthEmail(rule.userId)
        if (!userIdentity?.email) {
          console.warn(`  ⚠️ Missing email for auth user ${rule.userId}`)
          continue
        }

        // Send notification immediately for high priority
        if (result.priority === 'high') {
          await sendAlertNotification(
            rule,
            alert,
            userIdentity.email,
            userIdentity.name
          )
          totalNotificationsSent++
          console.log(`  📧 Notification sent to ${userIdentity.email}`)
        } else {
          // Queue for batch processing
          await supabase.from('email_queue').insert({
            user_id: rule.userId,
            email: userIdentity.email,
            subject: result.title,
            html_content: result.message,
            text_content: result.message,
            alert_id: alert.id,
            status: 'pending',
          })
          console.log('  📨 Notification queued for batch processing')
        }
      }
    }

    const duration = Date.now() - startTime
    console.log('\n✅ Alert processing complete!')
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log(`   Alerts created: ${totalAlertsCreated}`)
    console.log(`   Notifications sent: ${totalNotificationsSent}`)

  } catch (error) {
    console.error('❌ Alert processing failed:', error)
    process.exit(1)
  }
}

// Run the script
processAlerts()
