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

interface ChatInterfaceProps {
  symbol?: string
  userId?: string
  sessionId?: string
  initialMessages?: Message[]
  className?: string
}

const suggestedQuestions = [
  '这家公司值得投资吗？',
  '最新财报有哪些亮点？',
  '与同行业相比表现如何？',
  '分析师的目标价是多少？',
  '投资这家公司有什么风险？',
]

const quickActions = [
  { label: '投资评级', query: '的投资评级是什么？' },
  { label: '财务分析', query: '的财务状况如何？' },
  { label: '估值分析', query: '现在估值贵吗？' },
  { label: '竞争优势', query: '的护城河是什么？' },
]

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
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add loading message
    const loadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      isLoading: true,
    }
    setMessages(prev => [...prev, loadingMessage])

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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Update conversation ID if new
      if (data.isNewConversation) {
        setConversationId(data.conversationId)
      }

      // Replace loading message with actual response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response.content,
        sources: data.response.sources,
      }

      setMessages(prev =>
        prev.filter(m => m.id !== 'loading').concat(assistantMessage)
      )
    } catch (error) {
      console.error('Chat error:', error)

      // Replace loading with error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回答这个问题。请稍后再试。',
      }

      setMessages(prev =>
        prev.filter(m => m.id !== 'loading').concat(errorMessage)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (action: { label: string; query: string }) => {
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
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">思考中...</span>
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
