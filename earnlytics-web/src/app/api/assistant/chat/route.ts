import { NextRequest, NextResponse } from 'next/server'
import {
  processChatMessage,
  createConversation,
  saveMessage,
  getConversationHistory,
  extractSymbols,
  generateConversationTitle,
} from '@/lib/ai/assistant'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, symbol, userId, sessionId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let currentConversationId = conversationId
    let isNewConversation = false

    // Create new conversation if needed
    if (!currentConversationId) {
      const title = generateConversationTitle(message)
      // Extract symbol from message if not provided
      const mentionedSymbols = extractSymbols(message)
      const conversationSymbol = symbol || mentionedSymbols[0]

      currentConversationId = await createConversation(
        userId,
        sessionId,
        conversationSymbol,
        title
      )
      isNewConversation = true
    }

    // Get conversation history
    const history = await getConversationHistory(currentConversationId, 20)
    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    // Save user message
    await saveMessage(currentConversationId, 'user', message)

    // Process message with AI
    const response = await processChatMessage(
      message,
      symbol,
      conversationHistory
    )

    // Save AI response
    await saveMessage(currentConversationId, 'assistant', response.content, {
      model: 'deepseek-chat',
      tokensUsed: response.tokensUsed,
      sources: response.sources,
      processingTimeMs: response.processingTimeMs,
    })

    return NextResponse.json({
      success: true,
      conversationId: currentConversationId,
      isNewConversation,
      response: {
        content: response.content,
        sources: response.sources,
        processingTimeMs: response.processingTimeMs,
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: 'Failed to process message', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const history = await getConversationHistory(conversationId, 50)

    return NextResponse.json({
      success: true,
      messages: history.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
        createdAt: msg.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get history API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: 'Failed to get conversation history', details: errorMessage },
      { status: 500 }
    )
  }
}
