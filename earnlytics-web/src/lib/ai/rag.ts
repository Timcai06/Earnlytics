import { supabase } from '@/lib/supabase'
import { SearchResult } from '@/types/investment'
import { generateEmbedding } from './embeddings'

const DEFAULT_MATCH_THRESHOLD = 0.7
const DEFAULT_MATCH_COUNT = 5

export interface RAGSearchOptions {
  symbol?: string
  matchThreshold?: number
  matchCount?: number
}

/**
 * Search for relevant documents using vector similarity
 */
export async function searchDocuments(
  query: string,
  options: RAGSearchOptions = {}
): Promise<SearchResult[]> {
  const { symbol, matchThreshold = DEFAULT_MATCH_THRESHOLD, matchCount = DEFAULT_MATCH_COUNT } = options

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query)

  // Search using Supabase RPC function
  
  const { data, error } = await supabase.rpc('search_documents', {
    query_embedding: embedding,
    target_symbol: symbol ?? null,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) {
    console.error('RAG search error:', error)
    throw new Error(`Failed to search documents: ${error.message}`)
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    sourceType: item.source_type,
    sourceId: item.source_id,
    symbol: item.symbol,
    title: item.title,
    contentChunk: item.content_chunk,
    similarity: item.similarity,
    metadata: item.metadata,
  }))
}

/**
 * Search with context assembly for AI responses
 */
export async function searchWithContext(
  query: string,
  options: RAGSearchOptions = {}
): Promise<{
  results: SearchResult[]
  context: string
  sources: { title: string; sourceType: string; symbol: string }[]
}> {
  const results = await searchDocuments(query, options)

  // Build context string from results
  const contextParts: string[] = []
  const sources: { title: string; sourceType: string; symbol: string }[] = []

  for (const result of results) {
    contextParts.push(`[${result.sourceType}] ${result.title}\n${result.contentChunk}`)
    sources.push({
      title: result.title,
      sourceType: result.sourceType,
      symbol: result.symbol,
    })
  }

  return {
    results,
    context: contextParts.join('\n\n---\n\n'),
    sources,
  }
}

/**
 * Hybrid search: combines vector similarity with keyword matching
 */
export async function hybridSearch(
  query: string,
  keywords: string[],
  options: RAGSearchOptions = {}
): Promise<SearchResult[]> {
  // First, try vector search
  const vectorResults = await searchDocuments(query, {
    ...options,
    matchCount: (options.matchCount || DEFAULT_MATCH_COUNT) * 2,
  })

  // If we have keywords, boost results that contain them
  if (keywords.length > 0) {
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()))

    const scoredResults = vectorResults.map(result => {
      const content = result.contentChunk.toLowerCase()
      let keywordMatches = 0

      for (const keyword of keywordSet) {
        if (content.includes(keyword)) {
          keywordMatches++
        }
      }

      // Boost score based on keyword matches
      const keywordBoost = keywordMatches / keywordSet.size * 0.1
      return {
        ...result,
        similarity: result.similarity + keywordBoost,
      }
    })

    // Sort by boosted similarity
    scoredResults.sort((a, b) => b.similarity - a.similarity)

    // Return top results
    return scoredResults.slice(0, options.matchCount || DEFAULT_MATCH_COUNT)
  }

  return vectorResults.slice(0, options.matchCount || DEFAULT_MATCH_COUNT)
}

/**
 * Get knowledge base articles by category
 */
export async function getKnowledgeBaseArticles(
  category?: string,
  limit: number = 10
): Promise<Array<{
  id: string
  title: string
  slug: string
  summary: string
  category: string
}>> {
  

  let queryBuilder = supabase
    .from('knowledge_base')
    .select('id, title, slug, summary, category')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }

  const { data, error } = await queryBuilder

  if (error) {
    console.error('Knowledge base fetch error:', error)
    throw new Error(`Failed to fetch knowledge base: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific knowledge base article by slug
 */
export async function getKnowledgeBaseArticle(
  slug: string
): Promise<{
  id: string
  title: string
  content: string
  category: string
  keywords: string[]
} | null> {
  

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, content, category, keywords')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Knowledge base article fetch error:', error)
    throw new Error(`Failed to fetch article: ${error.message}`)
  }

  return data
}

/**
 * Build system prompt with retrieved context
 */
export function buildRAGSystemPrompt(context: string, hasResults: boolean): string {
  const basePrompt = `你是一个专业的投资分析助手，帮助用户理解财报、分析公司和做出投资决策。

你的回答应该：
1. 基于提供的数据和上下文
2. 使用清晰、专业的中文
3. 给出具体的投资建议而非泛泛而谈
4. 如有不确定性，明确说明
5. 引用数据来源，增强可信度`

  if (hasResults) {
    return `${basePrompt}

以下是与用户问题相关的参考资料，请基于这些资料回答：

---
${context}
---

请基于上述资料回答用户的问题。如果资料不足以完全回答问题，请明确说明。`
  }

  return `${basePrompt}

没有找到与问题直接相关的资料，请基于你的知识回答，并建议用户查看最新的财报数据。`
}
