-- Feature 8: AI Investment Memos
-- User notes with version history, semantic search and AI alignment metadata

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS user_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  earning_id INTEGER NOT NULL REFERENCES earnings(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL REFERENCES companies(symbol),
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  latest_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, earning_id)
);

CREATE TABLE IF NOT EXISTS user_note_versions (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  ai_alignment_score NUMERIC(5, 4),
  ai_alignment_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, version)
);

CREATE TABLE IF NOT EXISTS user_note_embeddings (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL UNIQUE REFERENCES user_notes(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_updated
  ON user_notes(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notes_symbol
  ON user_notes(user_id, symbol, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_note_versions_note
  ON user_note_versions(note_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_user_note_embeddings_embedding
  ON user_note_embeddings
  USING hnsw (embedding vector_cosine_ops);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_note_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view notes" ON user_notes;
CREATE POLICY "Users can view notes" ON user_notes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert notes" ON user_notes;
CREATE POLICY "Users can insert notes" ON user_notes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update notes" ON user_notes;
CREATE POLICY "Users can update notes" ON user_notes
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view note versions" ON user_note_versions;
CREATE POLICY "Users can view note versions" ON user_note_versions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert note versions" ON user_note_versions;
CREATE POLICY "Users can insert note versions" ON user_note_versions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view note embeddings" ON user_note_embeddings;
CREATE POLICY "Users can view note embeddings" ON user_note_embeddings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert note embeddings" ON user_note_embeddings;
CREATE POLICY "Users can insert note embeddings" ON user_note_embeddings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update note embeddings" ON user_note_embeddings;
CREATE POLICY "Users can update note embeddings" ON user_note_embeddings
  FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION search_user_notes(
  query_embedding vector(1536),
  target_user_id INTEGER,
  filter_symbol TEXT DEFAULT NULL,
  match_count INTEGER DEFAULT 20,
  match_threshold DOUBLE PRECISION DEFAULT 0.2
)
RETURNS TABLE (
  note_id INTEGER,
  earning_id INTEGER,
  symbol TEXT,
  content TEXT,
  tags TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id AS note_id,
    n.earning_id,
    n.symbol::TEXT,
    n.content,
    n.tags,
    n.updated_at,
    (1 - (e.embedding <=> query_embedding))::DOUBLE PRECISION AS similarity
  FROM user_notes n
  JOIN user_note_embeddings e ON e.note_id = n.id
  WHERE
    n.user_id = target_user_id
    AND (filter_symbol IS NULL OR n.symbol = filter_symbol)
    AND (1 - (e.embedding <=> query_embedding))::DOUBLE PRECISION >= match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_user_notes(vector(1536), INTEGER, TEXT, INTEGER, DOUBLE PRECISION) TO service_role;
