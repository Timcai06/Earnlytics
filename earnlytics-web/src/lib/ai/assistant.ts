import { openai } from './openai-client'
import { searchWithContext, buildRAGSystemPrompt } from './rag'
import { supabase } from '@/lib/supabase'
import { ChatMessage, RAGSource } from '@/types/investment'

const CHAT_MODEL = 'deepseek-chat'
const MAX_CONTEXT_LENGTH = 4000

export interface ChatResponse {
  content: string
  sources: RAGSource[]
  tokensUsed: number
  processingTimeMs: number
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Process a user message and generate AI response with RAG
 */
export async function processChatMessage(
  message: string,
  symbol: string | undefined,
  conversationHistory: ConversationMessage[]
): Promise<ChatResponse> {
  const startTime = Date.now()

  try {
    console.log('[Assistant] Processing message:', message)

    // Search for relevant context
    const { context, sources } = await searchWithContext(message, {
      symbol,
      matchCount: 5,
      matchThreshold: 0.7,
    })
    console.log('[Assistant] Found sources:', sources.length)

    // Build system prompt with context
    const hasResults = sources.length > 0
    const systemPrompt = buildRAGSystemPrompt(context, hasResults)

    // Truncate context if too long
    const truncatedContext = context.length > MAX_CONTEXT_LENGTH
      ? context.slice(0, MAX_CONTEXT_LENGTH) + '\n... (内容已截断)'
      : context

    // Build messages array
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message },
    ]

    console.log('[Assistant] Calling DeepSeek API...')

    // Call AI API
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    console.log('[Assistant] DeepSeek response received')

    const content = response.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'
    const tokensUsed = response.usage?.total_tokens || 0

    // Build RAG sources for response
    const ragSources: RAGSource[] = sources.map((source, index) => ({
      sourceType: source.sourceType,
      sourceId: `source-${index}`,
      title: source.title,
      content: '',
      similarity: 0.8, // Placeholder
    }))

    return {
      content,
      sources: ragSources,
      tokensUsed,
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Chat processing error:', errorMessage)
    console.error('Error stack:', errorStack)

    // Return fallback response
    return {
      content: `抱歉，我暂时无法处理您的请求。错误: ${errorMessage}`,
      sources: [],
      tokensUsed: 0,
      processingTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Create a new chat conversation
 */
export async function createConversation(
  userId: string | undefined,
  sessionId: string | undefined,
  symbol: string | undefined,
  title: string
): Promise<string> {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: userId,
      session_id: sessionId,
      symbol,
      title: title.slice(0, 100),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Create conversation error:', error)
    throw new Error(`Failed to create conversation: ${error.message}`)
  }

  return data.id
}

/**
 * Save a message to the conversation
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata: {
    model?: string
    tokensUsed?: number
    sources?: RAGSource[]
    processingTimeMs?: number
  } = {}
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    model: metadata.model,
    tokens_used: metadata.tokensUsed,
    sources: metadata.sources || [],
    processing_time_ms: metadata.processingTimeMs,
  })

  if (error) {
    console.error('Save message error:', error)
    throw new Error(`Failed to save message: ${error.message}`)
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Get conversation history error:', error)
    throw new Error(`Failed to get history: ${error.message}`)
  }

  interface DBChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokens_used?: number;
    sources?: RAGSource[];
    processing_time_ms?: number;
    created_at: string;
  }

  return (data || []).map((msg: DBChatMessage) => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    role: msg.role,
    content: msg.content,
    model: msg.model,
    tokensUsed: msg.tokens_used,
    sources: msg.sources,
    processingTimeMs: msg.processing_time_ms,
    createdAt: msg.created_at,
  }))
}

/**
 * Extract mentioned stock symbols from message
 */
export function extractSymbols(message: string): string[] {
  // Match common patterns: $AAPL, Apple, AAPL
  const patterns = [
    /\$([A-Z]{1,5})/g, // $AAPL
    /\b(AAPL|MSFT|GOOGL|AMZN|META|NVDA|TSLA|NFLX|AMD|CRM|AVGO|ORCL|ADBE|IBM|INTC|QCOM|TXN|NOW|PANW|PLTR|SNOW|CRWD|DDOG|NET|MDB|ZS|OKTA|DOCU|ROKU|UBER)\b/gi, // Direct ticker
  ]

  const symbols = new Set<string>()

  for (const pattern of patterns) {
    const matches = message.matchAll(pattern)
    for (const match of matches) {
      symbols.add(match[1].toUpperCase())
    }
  }

  return Array.from(symbols)
}

/**
 * Generate conversation title from first message
 */
export function generateConversationTitle(message: string): string {
  // Extract first sentence or first 30 chars
  const firstSentence = message.split(/[.!?。！？]/)[0]
  const title = firstSentence.slice(0, 30)
  return title.length < message.length ? title + '...' : title
}

/**
 * Get suggested questions for a symbol
 */
export function getSuggestedQuestions(symbol: string): string[] {
  return [
    `${symbol}现在值得投资吗？`,
    `${symbol}的财务状况如何？`,
    `${symbol}相比同行业公司表现怎样？`,
    `${symbol}最新财报有哪些亮点？`,
    `分析师对${symbol}的目标价是多少？`,
  ]
}

/**
 * Get quick action buttons for chat
 */
export function getQuickActions(symbol?: string): Array<{
  label: string
  action: string
}> {
  if (symbol) {
    return [
      { label: '投资评级', action: `${symbol}的投资评级是什么？` },
      { label: '财务分析', action: `分析${symbol}的财务状况` },
      { label: '估值分析', action: `${symbol}现在估值贵吗？` },
      { label: '风险评估', action: `投资${symbol}有哪些风险？` },
    ]
  }

  return [
    { label: '市场概览', action: '今天美股科技板块表现如何？' },
    { label: '推荐股票', action: '有什么值得关注的科技股？' },
    { label: '投资策略', action: '现在适合投资科技股吗？' },
    { label: '财报日历', action: '最近有哪些重要财报发布？' },
  ]
}
