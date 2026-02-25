import { NextRequest, NextResponse } from 'next/server'
import {
  processChatMessage,
  processChatMessageStream,
  createConversation,
  saveMessage,
  getConversationHistory,
  extractSymbols,
  generateConversationTitle,
  getSuggestedQuestions,
  getQuickActions,
} from '@/lib/ai/assistant'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, symbol, userId, sessionId, stream } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          let currentConversationId = conversationId

          try {
            if (!currentConversationId) {
              const title = generateConversationTitle(message)
              const mentionedSymbols = extractSymbols(message)
              const conversationSymbol = symbol || mentionedSymbols[0]

              currentConversationId = await createConversation(
                userId,
                sessionId,
                conversationSymbol,
                title
              )

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'conversation', id: currentConversationId })}\n\n`))
            }

            const history = await getConversationHistory(currentConversationId, 20)
            const conversationHistory = history.map(msg => ({
              role: msg.role,
              content: msg.content,
            }))

            await saveMessage(currentConversationId, 'user', message)

            await processChatMessageStream(
              message,
              symbol,
              conversationHistory,
              {
                onSources: (sources) => {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`))
                },
                onContent: (content: string, isFinal: boolean) => {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content, isFinal })}\n\n`))
                },
                onDone: async (fullContent: string, tokensUsed: number, processingTimeMs: number) => {
                  await saveMessage(currentConversationId!, 'assistant', fullContent, {
                    model: 'deepseek-chat',
                    tokensUsed,
                    sources: [],
                    processingTimeMs,
                  })

                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', tokensUsed, processingTimeMs })}\n\n`))
                  controller.close()
                },
                onError: (error: string) => {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error })}\n\n`))
                  controller.close()
                },
              }
            )
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`))
            controller.close()
          }
        },
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming response (original)
    let currentConversationId = conversationId
    let isNewConversation = false

    if (!currentConversationId) {
      const title = generateConversationTitle(message)
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

    const history = await getConversationHistory(currentConversationId, 20)
    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    await saveMessage(currentConversationId, 'user', message)

    const response = await processChatMessage(
      message,
      symbol,
      conversationHistory
    )

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
    const symbol = searchParams.get('symbol')
    const action = searchParams.get('action')

    // Get suggestions based on symbol
    if (action === 'suggestions') {
      const suggestedQuestions = symbol ? getSuggestedQuestions(symbol) : getSuggestedQuestions('')
      const quickActions = getQuickActions(symbol || undefined)

      return NextResponse.json({
        success: true,
        suggestedQuestions,
        quickActions,
      })
    }

    // Get conversation history
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
