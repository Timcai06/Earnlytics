import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

const embeddingClient = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
    })
  : null;

export const NOTE_EMBEDDING_DIMENSION = 1536;

export function isOpenAIEmbeddingEnabled(): boolean {
  return Boolean(embeddingClient);
}

export async function generateTextEmbedding(text: string): Promise<number[]> {
  if (!embeddingClient) {
    throw new Error("OpenAI embeddings not configured");
  }

  const normalized = text.trim();
  if (!normalized) {
    throw new Error("Embedding text cannot be empty");
  }

  const response = await embeddingClient.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: normalized,
  });

  const embedding = response.data?.[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Failed to generate embedding");
  }

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
