'use client'

import * as React from 'react'
import { Send, Bot, User, Loader2, Lightbulb, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RAGSource } from '@/types/investment'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: RAGSource[]
  isLoading?: boolean
}

interface QuickAction {
  label: string
  query: string
}

interface ChatInterfaceProps {
  symbol?: string
  userId?: string
  sessionId?: string
  initialMessages?: Message[]
  className?: string
}

export function ChatInterface({
  symbol,
  userId,
  sessionId,
  initialMessages = [],
  className,
}: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [conversationId, setConversationId] = React.useState<string | undefined>()
  const [suggestedQuestions, setSuggestedQuestions] = React.useState<string[]>([])
  const [quickActions, setQuickActions] = React.useState<QuickAction[]>([])
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Fetch suggestions based on symbol
  React.useEffect(() => {
    async function fetchSuggestions() {
      try {
        const url = new URL('/api/assistant/chat', window.location.origin)
        url.searchParams.set('action', 'suggestions')
        if (symbol) {
          url.searchParams.set('symbol', symbol)
        }

        const response = await fetch(url.toString())
        const data = await response.json()

        if (data.success) {
          setSuggestedQuestions(data.suggestedQuestions || [])
          setQuickActions(data.quickActions || [])
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      }
    }

    fetchSuggestions()
  }, [symbol])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessageId = `user-${Date.now()}`
    const loadingMessageId = `loading-${Date.now()}`

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content,
    }

    const loadingMessage: Message = {
      id: loadingMessageId,
      role: 'assistant',
      content: '',
      isLoading: true,
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInput('')
    setIsLoading(true)

    let conversationCreated = false

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
          symbol,
          userId,
          sessionId,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let currentSources: RAGSource[] = []

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue

          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'conversation') {
              conversationCreated = true
              setConversationId(data.id)
            } else if (data.type === 'sources') {
              currentSources = data.sources || []
            } else if (data.type === 'content') {
              if (data.content) {
                accumulatedContent += data.content
              }

              setMessages(prev =>
                prev.map(m =>
                  m.id === loadingMessageId
                    ? { 
                        ...m, 
                        content: accumulatedContent || '...', 
                        sources: currentSources,
                        isLoading: !data.isFinal 
                      }
                    : m
                )
              )
            } else if (data.type === 'done') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === loadingMessageId
                    ? { ...m, content: accumulatedContent || '...', isLoading: false }
                    : m
                )
              )
              setIsLoading(false)
            } else if (data.type === 'error') {
              throw new Error(data.error)
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      if (accumulatedContent) {
        setMessages(prev =>
          prev.map(m =>
            m.id === loadingMessageId
              ? { ...m, content: accumulatedContent, isLoading: false }
              : m
          )
        )
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Chat error:', error)

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回答这个问题。请稍后再试。',
      }

      setMessages(prev =>
        prev.filter(m => m.id !== loadingMessageId).concat(errorMessage)
      )
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (action: QuickAction) => {
    const prefix = symbol || ''
    sendMessage(prefix + action.query)
  }

  const handleSuggestedQuestion = (question: string) => {
    const prefix = symbol || ''
    sendMessage(prefix + question)
  }

  return (
    <div className={cn('flex flex-col h-[600px] border rounded-lg bg-card', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI 投资助手</h3>
          <p className="text-xs text-muted-foreground">
            {symbol ? `正在分析: ${symbol}` : '随时为您解答投资问题'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">我是您的投资分析助手</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                我可以帮您分析财报、评估投资价值、比较公司表现。请随时提问！
              </p>
            </div>

            {/* Quick Actions */}
            {symbol && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  快速分析
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="text-left p-2 text-xs rounded-md border hover:bg-accent transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                推荐问题
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-1.5 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-muted-foreground ml-2">正在输入</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">
                            参考来源:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-0.5 bg-background rounded"
                              >
                                {source.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={symbol ? `询问关于 ${symbol} 的问题...` : '输入您的问题...'}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          AI 生成的内容仅供参考，不构成投资建议
        </p>
      </form>
    </div>
  )
}
