const COHERE_API_KEY = process.env.COHERE_API_KEY
const COHERE_API_URL = 'https://api.cohere.ai/v1/embed'
const COHERE_MODEL = 'embed-english-v3.0'
const EMBEDDING_DIMENSIONS = 1024
const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

export interface EmbeddingResult {
  embedding: number[]
  tokensUsed: number
}

export interface TextChunk {
  content: string
  index: number
  totalChunks: number
}

/**
 * Generate embeddings for a text string using Cohere API
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      input_type: 'search_query',
      texts: [text],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cohere API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    embedding: data.embeddings[0],
    tokensUsed: Math.ceil(text.length / 4),
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingResult[]> {
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

/**
 * Split long text into overlapping chunks for better retrieval
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = CHUNK_SIZE): TextChunk[] {
  if (text.length <= maxChunkSize) {
    return [{ content: text, index: 0, totalChunks: 1 }]
  }

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = start + maxChunkSize

    // Try to break at sentence or word boundary
    if (end < text.length) {
      // Look for sentence ending
      const sentenceEnd = text.lastIndexOf('. ', end)
      if (sentenceEnd > start + maxChunkSize * 0.5) {
        end = sentenceEnd + 1
      } else {
        // Fall back to word boundary
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
      totalChunks: 0, // Will be set later
    })

    start = end - CHUNK_OVERLAP
    index++
  }

  // Update total chunks
  const totalChunks = chunks.length
  chunks.forEach(chunk => {
    chunk.totalChunks = totalChunks
  })

  return chunks
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Format document for embedding with metadata
 */
export function formatDocumentForEmbedding(params: {
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

/**
 * Estimate token count for text (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4)
}

/**
 * Validate embedding dimensions
 */
export function validateEmbedding(embedding: number[]): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSIONS &&
    embedding.every(n => typeof n === 'number' && !isNaN(n))
  )
}
