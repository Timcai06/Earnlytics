import OpenAI from 'openai'

const deepseekApiKey = process.env.DEEPSEEK_API_KEY
const deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

// Create OpenAI client configured for DeepSeek
export const openai = new OpenAI({
  apiKey: deepseekApiKey,
  baseURL: deepseekApiUrl?.replace('/chat/completions', ''),
})
