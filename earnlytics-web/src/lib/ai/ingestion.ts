import { supabase } from '@/lib/supabase'
import { splitTextIntoChunks, generateEmbeddingsBatch, formatDocumentForEmbedding } from './embeddings'

export interface IngestDocumentParams {
  sourceType: 'earnings' | 'research_report' | 'sec_filing' | 'analysis'
  sourceId: string
  symbol: string
  title: string
  content: string
  date?: string
  metadata?: Record<string, unknown>
}

/**
 * Ingest a document into the vector database
 */
export async function ingestDocument(params: IngestDocumentParams): Promise<void> {
  if (!supabase) throw new Error('Database not configured');

  const { sourceType, sourceId, symbol, title, content, date, metadata = {} } = params

  // Split content into chunks
  const chunks = splitTextIntoChunks(content, 1000)

  if (chunks.length === 0) {
    console.warn(`No content to ingest for ${symbol}: ${title}`)
    return
  }

  // Format chunks for embedding
  const formattedChunks = chunks.map(chunk =>
    formatDocumentForEmbedding({
      symbol,
      title,
      content: chunk.content,
      sourceType,
      date,
    })
  )

  // Generate embeddings in batches
  const batchSize = 10
  const allEmbeddings: number[][] = []

  for (let i = 0; i < formattedChunks.length; i += batchSize) {
    const batch = formattedChunks.slice(i, i + batchSize)
    const results = await generateEmbeddingsBatch(batch)
    allEmbeddings.push(...results.map(r => r.embedding))
  }

  // Insert into database
  

  const embeddingsData = chunks.map((chunk, index) => ({
    source_type: sourceType,
    source_id: sourceId,
    symbol,
    title,
    content_chunk: chunk.content,
    chunk_index: chunk.index,
    total_chunks: chunk.totalChunks,
    embedding: allEmbeddings[index],
    metadata: {
      ...metadata,
      date,
      formatted_text: formattedChunks[index],
    },
  }))

  const { error } = await supabase.from('document_embeddings').insert(embeddingsData)

  if (error) {
    console.error('Ingest document error:', error)
    throw new Error(`Failed to ingest document: ${error.message}`)
  }

  console.log(`Ingested ${chunks.length} chunks for ${symbol}: ${title}`)
}

/**
 * Delete existing embeddings for a source
 */
export async function deleteEmbeddingsForSource(
  sourceType: string,
  sourceId: string
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('document_embeddings')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)

  if (error) {
    console.error('Delete embeddings error:', error)
    throw new Error(`Failed to delete embeddings: ${error.message}`)
  }
}

/**
 * Re-ingest a document (delete old, insert new)
 */
export async function reingestDocument(params: IngestDocumentParams): Promise<void> {
  await deleteEmbeddingsForSource(params.sourceType, params.sourceId)
  await ingestDocument(params)
}

/**
 * Batch ingest multiple documents
 */
export async function batchIngestDocuments(
  documents: IngestDocumentParams[],
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = documents.length

  for (let i = 0; i < documents.length; i++) {
    try {
      await ingestDocument(documents[i])
      onProgress?.(i + 1, total)
    } catch (error) {
      console.error(`Failed to ingest document ${i + 1}/${total}:`, error)
      // Continue with next document
    }
  }
}

/**
 * Get embedding statistics
 */
export async function getEmbeddingStats(): Promise<{
  totalDocuments: number
  totalChunks: number
  bySourceType: Record<string, number>
  bySymbol: Record<string, number>
}> {
  if (!supabase) {
    return { totalDocuments: 0, totalChunks: 0, bySourceType: {}, bySymbol: {} };
  }

  // Get total chunks
  const { count: totalChunks, error: countError } = await supabase
    .from('document_embeddings')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    throw new Error(`Failed to get stats: ${countError.message}`)
  }

  // Get unique document count
  const { data: docData, error: docError } = await supabase
    .from('document_embeddings')
    .select('source_type, source_id')

  if (docError) {
    throw new Error(`Failed to get document stats: ${docError.message}`)
  }

  // Count unique documents by source type
  const uniqueDocs = new Set(docData?.map(d => `${d.source_type}:${d.source_id}`))
  const bySourceType: Record<string, Set<string>> = {}

  docData?.forEach(d => {
    if (!bySourceType[d.source_type]) {
      bySourceType[d.source_type] = new Set()
    }
    bySourceType[d.source_type].add(d.source_id)
  })

  // Get counts by symbol
  const { data: symbolData, error: symbolError } = await supabase
    .from('document_embeddings')
    .select('symbol')

  if (symbolError) {
    throw new Error(`Failed to get symbol stats: ${symbolError.message}`)
  }

  const bySymbol: Record<string, number> = {}
  symbolData?.forEach(d => {
    bySymbol[d.symbol] = (bySymbol[d.symbol] || 0) + 1
  })

  return {
    totalDocuments: uniqueDocs.size,
    totalChunks: totalChunks || 0,
    bySourceType: Object.fromEntries(
      Object.entries(bySourceType).map(([k, v]) => [k, v.size])
    ),
    bySymbol,
  }
}

/**
 * Check if embeddings exist for a source
 */
export async function hasEmbeddings(
  sourceType: string,
  sourceId: string
): Promise<boolean> {
  if (!supabase) return false;


  const { count, error } = await supabase
    .from('document_embeddings')
    .select('*', { count: 'exact', head: true })
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)

  if (error) {
    console.error('Check embeddings error:', error)
    return false
  }

  return (count || 0) > 0
}
