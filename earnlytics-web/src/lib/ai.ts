import { z } from 'zod'
import type { AIAnalysisResult, EarningWithCompany } from '@/types/database'

const deepseekApiKey = process.env.DEEPSEEK_API_KEY
const deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

const AnalysisResultSchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()),
  concerns: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
})

const SYSTEM_PROMPT = `你是一个专业的财务分析师，擅长分析美国科技公司的财报数据。
你的任务是根据提供的财报数据生成一份简洁的中文分析报告。

请用JSON格式返回以下字段：
{
  "summary": "整体业绩的中文摘要（200-300字）",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "concerns": ["关注点1", "关注点2"],
  "sentiment": "positive" | "neutral" | "negative"
}

分析要求：
1. summary应该客观总结公司的整体业绩表现
2. highlights列出3个最重要的积极因素
3. concerns列出1-2个需要关注的问题
4. sentiment根据整体表现判断：positive(积极), neutral(中性), negative(消极)

注意：只返回JSON，不要返回其他内容。`

export async function analyzeEarnings(
  earning: EarningWithCompany
): Promise<{ result: AIAnalysisResult; tokensUsed: number; costUsd: number }> {
  if (!deepseekApiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured')
  }

  const company = earning.companies
  
  const userPrompt = `请分析以下公司的财报数据：

公司: ${company.name} (${company.symbol})
财年: FY${earning.fiscal_year} Q${earning.fiscal_quarter}
发布日期: ${earning.report_date}

财务数据:
- 营收: $${earning.revenue?.toLocaleString() || 'N/A'}
- 营收同比增长: ${earning.revenue_yoy_growth || 'N/A'}%
- 每股收益 (EPS): $${earning.eps || 'N/A'}
- 预期 EPS: $${earning.eps_estimate || 'N/A'}
- EPS 超预期: ${earning.eps_surprise || 'N/A'}
- 净利润: $${earning.net_income?.toLocaleString() || 'N/A'}

请生成中文分析报告。`

  const response = await fetch(deepseekApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Empty response from DeepSeek API')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Failed to parse DeepSeek response as JSON')
  }

  const validated = AnalysisResultSchema.parse(parsed)
  
  const tokensUsed = data.usage?.total_tokens || 0
  const costUsd = calculateCost(tokensUsed)

  return {
    result: validated,
    tokensUsed,
    costUsd,
  }
}

function calculateCost(tokens: number): number {
  const pricePer1KTokens = 0.001
  return (tokens / 1000) * pricePer1KTokens
}

export function formatSentiment(sentiment: string): { label: string; color: string } {
  switch (sentiment) {
    case 'positive':
      return { label: '积极', color: 'text-green-500' }
    case 'negative':
      return { label: '消极', color: 'text-red-500' }
    default:
      return { label: '中性', color: 'text-gray-500' }
  }
}
