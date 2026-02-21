DROP FUNCTION IF EXISTS search_documents(vector, text, int);

CREATE FUNCTION search_documents(
  query_embedding vector(1024),
  filter_symbol text DEFAULT NULL,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content_chunk text,
  symbol text,
  similarity double precision,
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
    (1 - (de.embedding <=> query_embedding))::double precision AS similarity,
    de.source_type,
    de.source_id::text
  FROM document_embeddings de
  WHERE
    (filter_symbol IS NULL OR de.symbol = filter_symbol)
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
