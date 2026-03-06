import OpenAI from 'openai'

const DEFAULT_DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

let cachedClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (cachedClient) {
    return cachedClient
  }

  const deepseekApiKey = process.env.DEEPSEEK_API_KEY
  if (!deepseekApiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured')
  }

  const deepseekApiUrl = process.env.DEEPSEEK_API_URL || DEFAULT_DEEPSEEK_API_URL

  cachedClient = new OpenAI({
    apiKey: deepseekApiKey,
    baseURL: deepseekApiUrl.replace('/chat/completions', ''),
  })

  return cachedClient
}
