-- ============================================
-- Earnlytics Database Schema Update
-- Add stock_prices table for real-time stock price data
-- ============================================

-- 股价历史表
CREATE TABLE IF NOT EXISTS stock_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  change DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL(8, 2),
  high_52w DECIMAL(10, 2),
  low_52w DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, timestamp)
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_prices_timestamp ON stock_prices(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_timestamp ON stock_prices(symbol, timestamp DESC);

-- 启用RLS
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read access" ON stock_prices
  FOR SELECT USING (true);

-- 添加表注释
COMMENT ON TABLE stock_prices IS '股票价格历史数据表';
COMMENT ON COLUMN stock_prices.symbol IS '股票代码';
COMMENT ON COLUMN stock_prices.price IS '当前股价';
COMMENT ON COLUMN stock_prices.change IS '涨跌金额';
COMMENT ON COLUMN stock_prices.change_percent IS '涨跌百分比';
COMMENT ON COLUMN stock_prices.volume IS '成交量';
COMMENT ON COLUMN stock_prices.market_cap IS '市值';
COMMENT ON COLUMN stock_prices.pe_ratio IS '市盈率';
COMMENT ON COLUMN stock_prices.high_52w IS '52周最高价';
COMMENT ON COLUMN stock_prices.low_52w IS '52周最低价';
