import { supabase } from '@/lib/supabase'
import { AlertHistory, AlertRule } from '@/types/investment'

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'alerts@earnlytics.com'

export interface EmailTemplateData {
  userName?: string
  symbol: string
  alertType: string
  title: string
  message: string
  data: Record<string, unknown>
  dashboardUrl: string
}

/**
 * Send alert notification through configured channels
 */
export async function sendAlertNotification(
  rule: AlertRule,
  alert: AlertHistory,
  userEmail: string,
  userName?: string
): Promise<void> {
  const channels = rule.notificationChannels || ['email']

  for (const channel of channels) {
    switch (channel) {
      case 'email':
        await sendEmailNotification(rule, alert, userEmail, userName)
        break
      case 'push':
        // Push notification would be implemented with a service like OneSignal
        console.log('Push notification not yet implemented')
        break
    }
  }

  // Update alert sent status
  await updateAlertSentStatus(alert.id, channels)
}

/**
 * Queue email for sending (supports batch processing)
 */
export async function queueEmail(
  userId: string,
  email: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  alertId?: string
): Promise<void> {
  

  const { error } = await supabase.from('email_queue').insert({
    user_id: userId,
    email,
    subject,
    html_content: htmlContent,
    text_content: textContent,
    alert_id: alertId,
    status: 'pending',
  })

  if (error) {
    console.error('Failed to queue email:', error)
    throw new Error(`Failed to queue email: ${error.message}`)
  }
}

/**
 * Send email notification immediately
 */
async function sendEmailNotification(
  rule: AlertRule,
  alert: AlertHistory,
  userEmail: string,
  userName?: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, email not sent')
    return
  }

  const templateData: EmailTemplateData = {
    userName,
    symbol: alert.symbol || '',
    alertType: alert.alertType,
    title: alert.title,
    message: alert.message,
    data: alert.data,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/analysis/${alert.symbol}`,
  }

  const { subject, html, text } = buildEmailTemplate(templateData)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Earnlytics <${RESEND_FROM_EMAIL}>`,
        to: userEmail,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    console.log(`Email sent to ${userEmail} for alert ${alert.id}`)
  } catch (error) {
    console.error('Failed to send email:', error)
    // Queue for retry
    await queueEmail(rule.userId, userEmail, subject, html, text, alert.id)
  }
}

/**
 * Build email template
 */
function buildEmailTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const greeting = data.userName ? `您好，${data.userName}` : '您好'

  const subject = `【Earnlytics】${data.title}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    .data-table { width: 100%; margin: 15px 0; }
    .data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .data-table td:first-child { font-weight: 600; width: 40%; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 投资预警</h1>
  </div>
  <div class="content">
    <p>${greeting}</p>
    
    <div class="alert-box">
      <h2>${data.title}</h2>
      <p>${data.message}</p>
      
      ${Object.keys(data.data).length > 0 ? `
      <table class="data-table">
        ${Object.entries(data.data).map(([key, value]) => `
          <tr>
            <td>${formatKey(key)}</td>
            <td>${formatValue(value)}</td>
          </tr>
        `).join('')}
      </table>
      ` : ''}
    </div>
    
    <a href="${data.dashboardUrl}" class="button">查看详情 →</a>
    
    <div class="footer">
      <p>此邮件由 Earnlytics 自动发送</p>
      <p>如不想接收此类通知，请登录后调整通知设置</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
${greeting}

【${data.title}】

${data.message}

${Object.entries(data.data).map(([key, value]) => `${formatKey(key)}: ${formatValue(value)}`).join('\n')}

查看详情: ${data.dashboardUrl}

---
此邮件由 Earnlytics 自动发送
如不想接收此类通知，请登录后调整通知设置
  `.trim()

  return { subject, html, text }
}

/**
 * Format object key for display
 */
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    previousRating: '之前评级',
    newRating: '当前评级',
    previousPrice: '之前目标价',
    newPrice: '当前目标价',
    changePercent: '变化幅度',
    currentValue: '当前值',
    percentile: '历史分位',
    metric: '指标',
    days: '剩余天数',
    date: '日期',
    threshold: '设定阈值',
    currentPrice: '当前价格',
  }

  return keyMap[key] || key
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString()
    }
    return value.toFixed(2)
  }
  return String(value)
}

/**
 * Update alert sent status
 */
async function updateAlertSentStatus(alertId: string, channels: string[]): Promise<void> {
  

  const { error } = await supabase
    .from('alert_history')
    .update({
      sent_via: channels,
      delivered_at: new Date().toISOString(),
    })
    .eq('id', alertId)

  if (error) {
    console.error('Failed to update alert status:', error)
  }
}

/**
 * Process pending emails in queue
 */
export async function processEmailQueue(batchSize: number = 10): Promise<void> {
  

  // Get pending emails
  const { data: emails, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true })
    .limit(batchSize)

  if (error) {
    console.error('Failed to fetch email queue:', error)
    return
  }

  for (const email of (emails || [])) {
    try {
      if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured')
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Earnlytics <${RESEND_FROM_EMAIL}>`,
          to: email.email,
          subject: email.subject,
          html: email.html_content,
          text: email.text_content,
        }),
      })

      if (response.ok) {
        // Mark as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id)
      } else {
        throw new Error(`Resend API error: ${await response.text()}`)
      }
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error)

      // Increment retry count
      const newRetryCount = (email.retry_count || 0) + 1
      const status = newRetryCount >= 3 ? 'failed' : 'pending'

      await supabase
        .from('email_queue')
        .update({
          status,
          retry_count: newRetryCount,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', email.id)
    }
  }
}

/**
 * Send digest email for user
 */
export async function sendDigestEmail(
  userId: string,
  userEmail: string,
  period: 'daily' | 'weekly'
): Promise<void> {
  

  // Get alerts from the period
  const since = new Date()
  if (period === 'daily') {
    since.setDate(since.getDate() - 1)
  } else {
    since.setDate(since.getDate() - 7)
  }

  const { data: alerts, error } = await supabase
    .from('alert_history')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error || !alerts || alerts.length === 0) {
    return
  }

  const periodText = period === 'daily' ? '今日' : '本周'
  const subject = `【Earnlytics】${periodText}投资预警汇总 (${alerts.length}条)`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${periodText}预警汇总</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .alert-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #3b82f6; }
    .alert-title { font-weight: 600; margin-bottom: 5px; }
    .alert-time { color: #6b7280; font-size: 12px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${periodText}投资预警汇总</h1>
    <p>共 ${alerts.length} 条预警</p>
  </div>
  <div style="padding: 20px;">
    ${alerts.map(alert => `
      <div class="alert-item">
        <div class="alert-title">${alert.title}</div>
        <div>${alert.message}</div>
        <div class="alert-time">${new Date(alert.created_at).toLocaleString('zh-CN')}</div>
      </div>
    `).join('')}
  </div>
  <div class="footer">
    <p>登录 Earnlytics 查看更多详情</p>
  </div>
</body>
</html>
  `.trim()

  const text = `${periodText}投资预警汇总\n\n共 ${alerts.length} 条预警\n\n${alerts.map(alert => `- ${alert.title}\n  ${alert.message}`).join('\n\n')}`

  await queueEmail(userId, userEmail, subject, html, text)
}
