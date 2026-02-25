DROP INDEX IF EXISTS idx_document_embeddings_embedding;

ALTER TABLE document_embeddings 
ALTER COLUMN embedding TYPE vector(1024);

CREATE INDEX idx_document_embeddings_embedding 
ON document_embeddings 
USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1024),
  filter_symbol text DEFAULT NULL,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  title text,
  content_chunk text,
  symbol text,
  similarity float,
  source_type text,
  source_id text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.title,
    de.content_chunk,
    de.symbol,
    1 - (de.embedding <=> query_embedding) AS similarity,
    de.source_type,
    de.source_id
  FROM document_embeddings de
  WHERE
    (filter_symbol IS NULL OR de.symbol = filter_symbol)
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
