-- Portfolio Phase 3: History & AI Briefing
-- Historical NAV tracking and AI-generated portfolio briefings

-- Portfolio history table (daily snapshots)
CREATE TABLE IF NOT EXISTS portfolio_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_value DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_gain DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_gain_pct DECIMAL(8,4) NOT NULL DEFAULT 0,
  position_count INTEGER NOT NULL DEFAULT 0,
  positions_snapshot JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- Portfolio AI briefings table
CREATE TABLE IF NOT EXISTS portfolio_briefings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  sentiment VARCHAR(20) NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  highlights JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  total_value DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_change_pct DECIMAL(8,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_history_user_date ON portfolio_history(user_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_briefings_user_date ON portfolio_briefings(user_id, record_date DESC);

-- Enable RLS
ALTER TABLE portfolio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_briefings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_history
DROP POLICY IF EXISTS "Users can view own portfolio history" ON portfolio_history;
CREATE POLICY "Users can view own portfolio history" ON portfolio_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own portfolio history" ON portfolio_history;
CREATE POLICY "Users can insert own portfolio history" ON portfolio_history
  FOR INSERT WITH CHECK (true);

-- RLS Policies for portfolio_briefings
DROP POLICY IF EXISTS "Users can view own portfolio briefings" ON portfolio_briefings;
CREATE POLICY "Users can view own portfolio briefings" ON portfolio_briefings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own portfolio briefings" ON portfolio_briefings;
CREATE POLICY "Users can insert own portfolio briefings" ON portfolio_briefings
  FOR INSERT WITH CHECK (true);
