/**
 * Send Pending Emails Script
 * 
 * Processes the email queue and sends pending emails in batches.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { processEmailQueue } from '../../src/lib/alerts/notifications'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not configured')
  process.exit(1)
}

async function sendPendingEmails() {
  console.log('📧 Processing email queue...')
  const startTime = Date.now()

  try {
    await processEmailQueue(50) // Process up to 50 emails at a time

    const duration = Date.now() - startTime
    console.log(`✅ Email processing complete! (${(duration / 1000).toFixed(2)}s)`)

  } catch (error) {
    console.error('❌ Email processing failed:', error)
    process.exit(1)
  }
}

sendPendingEmails()
