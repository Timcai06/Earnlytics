import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

const BRIEFING_SYSTEM_PROMPT = `你是一个专业的AI投资助手，擅长分析用户的股票投资组合并提供简洁的投资建议。

请根据提供的持仓数据，生成一份简洁的中文投资简报。

要求：
1. 内容简洁，控制在50字以内
2. 包含对整体表现的评估
3. 指出需要注意的风险（如财报临近）
4. 给出明确的操作建议（增持/持有/减持）

只返回JSON格式：
{
  "content": "简报正文（50字以内）",
  "sentiment": "positive" | "neutral" | "negative",
  "highlights": ["亮点1", "亮点2"],
  "concerns": ["关注点1"]
}`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    const userIdNum = parseInt(userId)
    const today = new Date().toISOString().split('T')[0]

    const { data: briefing, error } = await supabase
      .from('portfolio_briefings')
      .select('*')
      .eq('user_id', userIdNum)
      .eq('record_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching briefing:', error)
    }

    if (briefing) {
      return NextResponse.json({
        briefing: {
          content: briefing.content,
          sentiment: briefing.sentiment,
          highlights: briefing.highlights,
          concerns: briefing.concerns,
          createdAt: briefing.created_at
        },
        isGenerated: true
      })
    }

    return NextResponse.json({
      briefing: null,
      isGenerated: false
    })

  } catch (error) {
    console.error('Portfolio briefing GET error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(user_id)

    const { data: positions, error: positionsError } = await supabase
      .from('user_portfolios')
      .select('symbol, shares, avg_cost_basis')
      .eq('user_id', userIdNum)

    if (positionsError || !positions || positions.length === 0) {
      return NextResponse.json(
        { error: '暂无持仓' },
        { status: 400 }
      )
    }

    const symbols = positions.map(p => p.symbol)

    const { data: prices } = await supabase
      .from('stock_prices')
      .select('symbol, price, change_percent')
      .in('symbol', symbols)
      .order('timestamp', { ascending: false })
      .limit(symbols.length)

    const priceMap = new Map()
    if (prices) {
      prices.forEach(p => {
        if (!priceMap.has(p.symbol)) {
          priceMap.set(p.symbol, p)
        }
      })
    }

    let totalValue = 0
    let totalCost = 0
    const positionsData = positions.map(p => {
      const priceData = priceMap.get(p.symbol)
      const currentPrice = priceData?.price || 0
      const value = currentPrice * p.shares
      const cost = p.avg_cost_basis * p.shares
      totalValue += value
      totalCost += cost
      return {
        symbol: p.symbol,
        shares: p.shares,
        avgCost: p.avg_cost_basis,
        currentPrice,
        value,
        cost,
        gain: value - cost,
        gainPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
        changePct: priceData?.change_percent || 0
      }
    })

    const totalGain = totalValue - totalCost
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

    const { data: upcomingEarnings } = await supabase
      .from('earnings')
      .select('symbol, report_date')
      .in('symbol', symbols)
      .gte('report_date', new Date().toISOString().split('T')[0])
      .order('report_date', { ascending: true })
      .limit(5)

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY

    if (!deepseekApiKey) {
      return NextResponse.json(
        { error: 'AI服务未配置' },
        { status: 503 }
      )
    }

    const userPrompt = `请分析我的投资组合：

持仓概况：
- 总市值: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
- 总成本: $${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
- 总盈亏: $${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${totalGainPct >= 0 ? '+' : ''}${totalGainPct.toFixed(2)}%)

持仓明细：
${positionsData.map(p => `- ${p.symbol}: ${p.shares}股，成本$${p.avgCost.toFixed(2)}，现价$${p.currentPrice.toFixed(2)}，盈亏${p.gain >= 0 ? '+' : ''}${p.gainPct.toFixed(2)}%`).join('\n')}

${upcomingEarnings && upcomingEarnings.length > 0 ? `即将发布财报：${upcomingEarnings.map(e => `${e.symbol} (${e.report_date})`).join(', ')}` : '近期无财报发布'}

请生成今日投资简报。`

    const response = await fetch(deepseekApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: BRIEFING_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', errorText)
      return NextResponse.json(
        { error: 'AI生成失败' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'AI响应为空' },
        { status: 500 }
      )
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json(
        { error: 'AI响应格式错误' },
        { status: 500 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    const { error: upsertError } = await supabase
      .from('portfolio_briefings')
      .upsert({
        user_id: userIdNum,
        record_date: today,
        content: parsed.content as string || '暂无简报',
        sentiment: parsed.sentiment as string || 'neutral',
        highlights: (parsed.highlights as string[]) || [],
        concerns: (parsed.concerns as string[]) || [],
        total_value: totalValue,
        total_change_pct: totalGainPct
      }, {
        onConflict: 'user_id,record_date'
      })

    if (upsertError) {
      console.error('Error saving briefing:', upsertError)
    }

    return NextResponse.json({
      success: true,
      briefing: {
        content: parsed.content,
        sentiment: parsed.sentiment,
        highlights: parsed.highlights,
        concerns: parsed.concerns
      }
    })

  } catch (error) {
    console.error('Portfolio briefing POST error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
