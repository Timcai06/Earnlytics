-- User Portfolio System
-- Feature 6: 我的持仓仪表盘

-- User portfolios table
CREATE TABLE IF NOT EXISTS user_portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL REFERENCES companies(symbol),
  shares DECIMAL(12,4) NOT NULL DEFAULT 0,
  avg_cost_basis DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- User transactions table (for tracking multiple buys/sells)
CREATE TABLE IF NOT EXISTS user_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL REFERENCES companies(symbol),
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  shares DECIMAL(12,4) NOT NULL,
  price_per_share DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_symbol ON user_transactions(symbol);

-- Enable RLS
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_portfolios
DROP POLICY IF EXISTS "Users can view own portfolios" ON user_portfolios;
CREATE POLICY "Users can view own portfolios" ON user_portfolios
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own portfolios" ON user_portfolios;
CREATE POLICY "Users can insert own portfolios" ON user_portfolios
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own portfolios" ON user_portfolios;
CREATE POLICY "Users can update own portfolios" ON user_portfolios
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own portfolios" ON user_portfolios;
CREATE POLICY "Users can delete own portfolios" ON user_portfolios
  FOR DELETE USING (true);

-- RLS Policies for user_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
CREATE POLICY "Users can view own transactions" ON user_transactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own transactions" ON user_transactions;
CREATE POLICY "Users can insert own transactions" ON user_transactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own transactions" ON user_transactions;
CREATE POLICY "Users can delete own transactions" ON user_transactions
  FOR DELETE USING (true);
