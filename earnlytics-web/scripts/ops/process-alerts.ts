/**
 * Process Alert Rules Script
 * 
 * This script evaluates all active alert rules against current market data
n * and creates alerts when conditions are met.
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
  peRatio: number
  pePercentile: number
  rating: string
  targetPrice: number
}

async function fetchCompanyData(symbol: string): Promise<CompanyData | null> {
  // Fetch current data from database
  const { data: valuation } = await supabase
    .from('company_valuation')
    .select('*')
    .eq('symbol', symbol)
    .single()

  const { data: analysis } = await supabase
    .from('ai_analyses')
    .select('investment_rating, target_price_low, target_price_high')
    .eq('symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!valuation) {
    return null
  }

  return {
    symbol,
    currentPrice: valuation.current_price || 0,
    peRatio: valuation.pe_ratio || 0,
    pePercentile: valuation.pe_percentile || 50,
    rating: analysis?.investment_rating || 'hold',
    targetPrice: analysis ? (analysis.target_price_low + analysis.target_price_high) / 2 : 0,
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

    const symbols = [...new Set((rules || []).map(r => r.symbol))]
    console.log(`📊 Processing alerts for ${symbols.length} symbols`)

    let totalAlertsCreated = 0
    let totalNotificationsSent = 0

    for (const symbol of symbols) {
      console.log(`\n🔍 Processing ${symbol}...`)

      // Fetch current company data
      const companyData = await fetchCompanyData(symbol)
      if (!companyData) {
        console.log(`  ⚠️ No data found for ${symbol}`)
        continue
      }

      // Evaluate rules for this symbol
      const context = {
        symbol,
        currentPrice: companyData.currentPrice,
        peRatio: companyData.peRatio,
        pePercentile: companyData.pePercentile,
        currentRating: companyData.rating,
        targetPrice: companyData.targetPrice,
      }

      const triggeredRules = await evaluateRulesForSymbol(symbol, context)
      console.log(`  ✅ ${triggeredRules.length} rules triggered`)

      for (const { rule, result } of triggeredRules) {
        if (!result.triggered || !result.title || !result.message) {
          continue
        }

        // Create alert in database
        const { data: alert, error: alertError } = await supabase
          .from('alert_history')
          .insert({
            rule_id: rule.id,
            user_id: rule.userId,
            symbol,
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

        // Update rule trigger count
        await supabase
          .from('alert_rules')
          .update({
            last_triggered_at: new Date().toISOString(),
            trigger_count: supabase.rpc('increment_trigger_count', { rule_id: rule.id }),
          })
          .eq('id', rule.id)

        // Get user email
        const { data: user } = await supabase
          .from('users')
          .select('email, raw_user_meta_data')
          .eq('id', rule.userId)
          .single()

        if (user?.email) {
          // Send notification immediately for high priority
          if (result.priority === 'high') {
            await sendAlertNotification(
              rule,
              alert,
              user.email,
              user.raw_user_meta_data?.name
            )
            totalNotificationsSent++
            console.log(`  📧 Notification sent to ${user.email}`)
          } else {
            // Queue for batch processing
            await supabase.from('email_queue').insert({
              user_id: rule.userId,
              email: user.email,
              subject: result.title,
              html_content: result.message,
              text_content: result.message,
              alert_id: alert.id,
              status: 'pending',
            })
            console.log(`  📨 Notification queued for batch processing`)
          }
        }
      }
    }

    const duration = Date.now() - startTime
    console.log(`\n✅ Alert processing complete!`)
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
