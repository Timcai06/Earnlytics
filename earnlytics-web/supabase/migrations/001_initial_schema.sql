-- ============================================
-- Earnlytics Database Schema
-- Plan 2: AI Automation
-- ============================================

-- 公司表
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sector VARCHAR(50),
  logo_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 财报表
CREATE TABLE IF NOT EXISTS earnings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER NOT NULL,
  report_date DATE NOT NULL,
  revenue NUMERIC(20, 2),
  revenue_yoy_growth DECIMAL(5, 2),
  eps DECIMAL(10, 2),
  eps_estimate DECIMAL(10, 2),
  eps_surprise DECIMAL(10, 2),
  net_income NUMERIC(20, 2),
  is_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year, fiscal_quarter)
);

-- AI分析表
CREATE TABLE IF NOT EXISTS ai_analyses (
  id SERIAL PRIMARY KEY,
  earnings_id INTEGER REFERENCES earnings(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  highlights JSONB,
  concerns JSONB,
  sentiment VARCHAR(20),
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邮件订阅表
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_earnings_company_id ON earnings(company_id);
CREATE INDEX IF NOT EXISTS idx_earnings_report_date ON earnings(report_date);
CREATE INDEX IF NOT EXISTS idx_earnings_is_analyzed ON earnings(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_earnings_id ON ai_analyses(earnings_id);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- 启用RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON earnings
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON ai_analyses
  FOR SELECT USING (true);

-- 插入10家科技公司初始数据
INSERT INTO companies (symbol, name, sector, logo_url) VALUES
  ('AAPL', 'Apple Inc.', '消费电子', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'),
  ('MSFT', 'Microsoft Corporation', '软件', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'),
  ('GOOGL', 'Alphabet Inc.', '互联网', 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'),
  ('NVDA', 'NVIDIA Corporation', '芯片', 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg'),
  ('META', 'Meta Platforms Inc.', '社交媒体', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg'),
  ('AMZN', 'Amazon.com Inc.', '电商', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'),
  ('TSLA', 'Tesla Inc.', '汽车', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg'),
  ('AMD', 'Advanced Micro Devices', '芯片', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg'),
  ('NFLX', 'Netflix Inc.', '流媒体', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'),
  ('CRM', 'Salesforce Inc.', '软件', 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg')
ON CONFLICT (symbol) DO NOTHING;
