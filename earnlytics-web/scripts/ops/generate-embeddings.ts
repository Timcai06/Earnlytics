import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const COHERE_API_KEY = process.env.COHERE_API_KEY
const COHERE_API_URL = 'https://api.cohere.ai/v1/embed'
const COHERE_MODEL = 'embed-english-v3.0'

if (!COHERE_API_KEY) {
  throw new Error('COHERE_API_KEY environment variable not set')
}

async function generateEmbeddingsBatch(texts: string[]): Promise<Array<{ embedding: number[]; tokensUsed: number }>> {
  const response = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      input_type: 'search_document',
      texts: texts,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cohere API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.embeddings.map((embedding: number[]) => ({
    embedding,
    tokensUsed: Math.ceil(texts.join('').length / 4),
  }))
}

function formatDocumentForEmbedding(params: {
  symbol: string
  title: string
  content: string
  sourceType: string
  date?: string
}): string {
  const { symbol, title, content, sourceType, date } = params

  const parts = [
    `Company: ${symbol}`,
    `Title: ${title}`,
    `Type: ${sourceType}`,
  ]

  if (date) {
    parts.push(`Date: ${date}`)
  }

  parts.push('', content)

  return parts.join('\n')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface EarningsWithAnalysis {
  id: number
  symbol: string
  company_name: string
  fiscal_year: number
  fiscal_quarter: number
  report_date: string
  revenue: number | null
  revenue_yoy_growth: number | null
  eps: number | null
  eps_estimate: number | null
  eps_surprise: number | null
  net_income: number | null
  summary: string | null
  highlights: string[] | null
  concerns: string[] | null
  sentiment: string | null
}

async function getAnalyzedEarnings(): Promise<EarningsWithAnalysis[]> {
  const { data, error } = await supabase
    .from('earnings')
    .select(`
      id,
      fiscal_year,
      fiscal_quarter,
      report_date,
      revenue,
      revenue_yoy_growth,
      eps,
      eps_estimate,
      eps_surprise,
      net_income,
      companies!inner (
        symbol,
        name
      ),
      ai_analyses (
        summary,
        highlights,
        concerns,
        sentiment
      )
    `)
    .eq('is_analyzed', true)
    .order('report_date', { ascending: false })

  if (error) {
    console.error('Error fetching analyzed earnings:', error)
    return []
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as number,
    symbol: (item.companies as { symbol: string }).symbol,
    company_name: (item.companies as { name: string }).name,
    fiscal_year: item.fiscal_year as number,
    fiscal_quarter: item.fiscal_quarter as number,
    report_date: item.report_date as string,
    revenue: item.revenue as number | null,
    revenue_yoy_growth: item.revenue_yoy_growth as number | null,
    eps: item.eps as number | null,
    eps_estimate: item.eps_estimate as number | null,
    eps_surprise: item.eps_surprise as number | null,
    net_income: item.net_income as number | null,
    summary: (item.ai_analyses as { summary: string } | null)?.summary ?? null,
    highlights: (item.ai_analyses as { highlights: string[] } | null)?.highlights ?? null,
    concerns: (item.ai_analyses as { concerns: string[] } | null)?.concerns ?? null,
    sentiment: (item.ai_analyses as { sentiment: string } | null)?.sentiment ?? null,
  }))
}

function formatEarningsForEmbedding(earning: EarningsWithAnalysis): string {
  const parts: string[] = []

  parts.push(`公司: ${earning.company_name} (${earning.symbol})`)
  parts.push(`财报期间: FY${earning.fiscal_year} Q${earning.fiscal_quarter}`)
  parts.push(`发布日期: ${earning.report_date}`)
  parts.push('')

  parts.push('财务数据:')
  if (earning.revenue !== null) {
    parts.push(`- 营收: $${earning.revenue.toLocaleString()}`)
  }
  if (earning.revenue_yoy_growth !== null) {
    parts.push(`- 营收同比增长: ${earning.revenue_yoy_growth}%`)
  }
  if (earning.eps !== null) {
    parts.push(`- 每股收益(EPS): $${earning.eps}`)
  }
  if (earning.eps_estimate !== null) {
    parts.push(`- 预期EPS: $${earning.eps_estimate}`)
  }
  if (earning.eps_surprise !== null) {
    parts.push(`- EPS超预期: ${earning.eps_surprise}%`)
  }
  if (earning.net_income !== null) {
    parts.push(`- 净利润: $${earning.net_income.toLocaleString()}`)
  }
  parts.push('')

  if (earning.summary) {
    parts.push('AI分析摘要:')
    parts.push(earning.summary)
    parts.push('')
  }

  if (earning.highlights && earning.highlights.length > 0) {
    parts.push('亮点:')
    earning.highlights.forEach((h) => parts.push(`- ${h}`))
    parts.push('')
  }

  if (earning.concerns && earning.concerns.length > 0) {
    parts.push('关注点:')
    earning.concerns.forEach((c) => parts.push(`- ${c}`))
    parts.push('')
  }

  if (earning.sentiment) {
    parts.push(`整体情绪: ${earning.sentiment}`)
  }

  return parts.join('\n')
}

function numberToUuid(num: number): string {
  const hex = num.toString(16).padStart(32, '0')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`
}

async function hasEmbeddings(earningsId: number): Promise<boolean> {
  const uuid = numberToUuid(earningsId)
  const { count, error } = await supabase
    .from('document_embeddings')
    .select('*', { count: 'exact', head: true })
    .eq('source_type', 'analysis')
    .eq('source_id', uuid)

  if (error) {
    console.error('Error checking embeddings:', error)
    return false
  }

  return (count || 0) > 0
}

async function clearEmbeddings(): Promise<void> {
  console.log('Clearing existing embeddings...')
  const { error } = await supabase
    .from('document_embeddings')
    .delete()
    .eq('source_type', 'analysis')
  
  if (error) {
    console.error('Error clearing embeddings:', error)
  } else {
    console.log('Existing embeddings cleared.')
  }
}

async function saveEmbeddings(
  earningId: number,
  symbol: string,
  title: string,
  chunks: Array<{ content: string; index: number; total: number }>,
  embeddings: number[][]
): Promise<boolean> {
  const sourceUuid = numberToUuid(earningId)
  const embeddingsData = chunks.map((chunk, index) => ({
    source_type: 'analysis',
    source_id: sourceUuid,
    symbol,
    title,
    content_chunk: chunk.content,
    chunk_index: chunk.index,
    total_chunks: chunk.total,
    embedding: embeddings[index],
    metadata: {
      earnings_id: earningId,
    },
  }))

  const { error } = await supabase.from('document_embeddings').insert(embeddingsData)

  if (error) {
    console.error('Error saving embeddings:', error)
    return false
  }

  return true
}

function chunkText(text: string, maxChunkSize: number = 1000): Array<{ content: string; index: number; total: number }> {
  if (text.length <= maxChunkSize) {
    return [{ content: text, index: 0, total: 1 }]
  }

  const chunks: Array<{ content: string; index: number; total: number }> = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = start + maxChunkSize

    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('. ', end)
      if (sentenceEnd > start + maxChunkSize * 0.5) {
        end = sentenceEnd + 1
      } else {
        const wordEnd = text.lastIndexOf(' ', end)
        if (wordEnd > start) {
          end = wordEnd
        }
      }
    } else {
      end = text.length
    }

    chunks.push({
      content: text.slice(start, end).trim(),
      index,
      total: 0,
    })

    start = end - 200
    index++
  }

  const totalChunks = chunks.length
  chunks.forEach((chunk) => {
    chunk.total = totalChunks
  })

  return chunks
}

async function generateEmbeddings() {
  const force = process.argv.includes('--force')
  
  console.log('=== Generating Embeddings for RAG ===\n')
  
  if (force) {
    await clearEmbeddings()
  }

  const earnings = await getAnalyzedEarnings()
  console.log(`Found ${earnings.length} analyzed earnings\n`)

  if (earnings.length === 0) {
    console.log('No analyzed earnings found. Please run analyze-batch first.')
    return { processed: 0, skipped: 0, errors: 0 }
  }

  let processed = 0
  let skipped = 0
  let errors = 0

  for (const earning of earnings) {
    try {
      const exists = await hasEmbeddings(earning.id)
      if (exists) {
        console.log(`Skipping ${earning.symbol} FY${earning.fiscal_year} Q${earning.fiscal_quarter} - embeddings already exist`)
        skipped++
        continue
      }

      const content = formatEarningsForEmbedding(earning)
      const title = `${earning.company_name} FY${earning.fiscal_year} Q${earning.fiscal_quarter} 财报分析`

      const chunks = chunkText(content, 1000)
      console.log(`Processing ${earning.symbol} - ${chunks.length} chunks`)

      const formattedChunks = chunks.map((chunk) =>
        formatDocumentForEmbedding({
          symbol: earning.symbol,
          title,
          content: chunk.content,
          sourceType: 'analysis',
          date: earning.report_date,
        })
      )

      const batchSize = 10
      const allEmbeddings: number[][] = []

      for (let i = 0; i < formattedChunks.length; i += batchSize) {
        const batch = formattedChunks.slice(i, i + batchSize)
        const results = await generateEmbeddingsBatch(batch)
        allEmbeddings.push(...results.map((r) => r.embedding))

        if (i + batchSize < formattedChunks.length) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      const saved = await saveEmbeddings(
        earning.id,
        earning.symbol,
        title,
        chunks,
        allEmbeddings
      )

      if (saved) {
        processed++
        console.log(`  ✓ Saved ${chunks.length} embeddings for ${earning.symbol}`)
      } else {
        errors++
        console.error(`  ✗ Failed to save embeddings for ${earning.symbol}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      errors++
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`  ✗ Error processing ${earning.symbol}:`, errorMessage)
    }
  }

  console.log('\n=== Summary ===')
  console.log(`Processed: ${processed}`)
  console.log(`Skipped (already exist): ${skipped}`)
  console.log(`Errors: ${errors}`)

  return { processed, skipped, errors }
}

generateEmbeddings()
  .then((result) => {
    console.log('\nDone!')
    process.exit(result.errors > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
