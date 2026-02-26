import { Metadata } from 'next'
import { ChatInterface } from '@/components/investment/ChatInterface'

export const metadata: Metadata = {
  title: 'AI 投资助手 | Earnlytics',
  description: '基于 AI 的智能投资分析助手，帮助您分析财报、评估投资价值',
}

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI 投资助手</h1>
          <p className="text-muted-foreground mt-2">
            基于财报数据的智能投资分析，助您做出更明智的投资决策
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </main>
  )
}
