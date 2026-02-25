/**
 * Send Digest Emails Script
 * 
 * Sends daily or weekly digest emails to users based on their preferences.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { sendDigestEmail } from '../../src/lib/alerts/notifications'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function sendDigests(period: 'daily' | 'weekly') {
  console.log(`📧 Sending ${period} digests...`)
  const startTime = Date.now()

  try {
    // Get users who want this digest frequency
    const { data: preferences, error } = await supabase
      .from('user_notification_preferences')
      .select('user_id, digest_frequency, digest_day, digest_time')
      .eq('digest_frequency', period)

    if (error) {
      throw error
    }

    let sentCount = 0

    for (const pref of (preferences || [])) {
      // Check if it's the right day for weekly digests
      if (period === 'weekly') {
        const today = new Date().getDay()
        if (today !== (pref.digest_day || 1)) {
          continue
        }
      }

      // Check if it's the right time
      const now = new Date()
      const [hours, minutes] = (pref.digest_time || '09:00:00').split(':')
      if (now.getHours() !== parseInt(hours) || now.getMinutes() > 5) {
        continue
      }

      // Get user email
      const { data: user } = await supabase
        .from('users')
        .select('email, raw_user_meta_data')
        .eq('id', pref.user_id)
        .single()

      if (user?.email) {
        await sendDigestEmail(pref.user_id, user.email, period)
        sentCount++
        console.log(`  ✅ Digest sent to ${user.email}`)
      }
    }

    const duration = Date.now() - startTime
    console.log(`\n✅ ${period} digests complete!`)
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log(`   Digests sent: ${sentCount}`)

  } catch (error) {
    console.error(`❌ ${period} digests failed:`, error)
    process.exit(1)
  }
}

// Get period from command line argument
const period = process.argv[2] as 'daily' | 'weekly'

if (!period || !['daily', 'weekly'].includes(period)) {
  console.error('Usage: tsx scripts/send-digests.ts <daily|weekly>')
  process.exit(1)
}

sendDigests(period)
