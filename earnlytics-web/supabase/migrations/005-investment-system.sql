-- ============================================
-- Earnlytics Investment System Schema
-- Phase 1: Data Infrastructure
-- ============================================

-- 1. 公司估值指标表
CREATE TABLE IF NOT EXISTS company_valuation (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  market_cap BIGINT,                    -- 市值
  pe_ratio DECIMAL(10,2),               -- 市盈率
  pb_ratio DECIMAL(10,2),               -- 市净率
  ps_ratio DECIMAL(10,2),               -- 市销率
  ev_ebitda DECIMAL(10,2),              -- 企业价值倍数
  roe DECIMAL(5,2),                     -- 净资产收益率
  roa DECIMAL(5,2),                     -- 总资产收益率
  debt_to_equity DECIMAL(5,2),          -- 负债权益比
  free_cash_flow BIGINT,                -- 自由现金流
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- 2. 行业基准表
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id SERIAL PRIMARY KEY,
  sector VARCHAR(50) NOT NULL,          -- 行业名称
  metric_name VARCHAR(50) NOT NULL,     -- 指标名
  avg_value DECIMAL(10,2),              -- 行业平均
  median_value DECIMAL(10,2),           -- 行业中位数
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sector, metric_name)
);

-- 3. 竞争对比表
CREATE TABLE IF NOT EXISTS peer_comparison (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  peer_symbol VARCHAR(10) NOT NULL,     -- 同行股票代码
  metric VARCHAR(50) NOT NULL,          -- 对比指标
  company_value DECIMAL(10,2),          -- 本公司值
  peer_value DECIMAL(10,2),             -- 同行值
  percentile INTEGER,                   -- 行业百分位 (0-100)
  comparison_date DATE,                 -- 对比日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, peer_symbol, metric, comparison_date)
);

-- 4. 研报主表
CREATE TABLE IF NOT EXISTS research_reports (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,          -- 股票代码
  title TEXT NOT NULL,                  -- 研报标题
  broker VARCHAR(50),                   -- 券商名称
  analyst VARCHAR(50),                  -- 分析师
  report_type VARCHAR(30),              -- 类型: industry/company/strategy
  rating VARCHAR(20),                   -- 评级: buy/accumulate/neutral/reduce/sell
  target_price DECIMAL(10,2),           -- 目标价
  current_price DECIMAL(10,2),          -- 报告发布时股价
  upside DECIMAL(5,2),                  -- 上涨空间 %
  publish_date DATE,                    -- 发布日期
  summary TEXT,                         -- AI生成的摘要
  key_points JSONB,                     -- 核心观点 ["point1", "point2"]
  risks JSONB,                          -- 风险提示
  forecasts JSONB,                      -- 盈利预测 {eps2024: x, eps2025: y}
  source_url TEXT,                      -- 来源链接
  is_ai_generated BOOLEAN DEFAULT FALSE, -- 是否为AI生成摘要
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 分析师追踪表
CREATE TABLE IF NOT EXISTS analyst_tracking (
  id SERIAL PRIMARY KEY,
  analyst_name VARCHAR(50) NOT NULL,    -- 分析师姓名
  broker VARCHAR(50),                   -- 券商
  sector VARCHAR(50),                   -- 覆盖行业
  accuracy_score DECIMAL(4,2),          -- 历史准确率 0-100
  avg_return DECIMAL(5,2),              -- 推荐后平均收益
  total_recommendations INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(analyst_name, broker)
);

-- 6. 盈利预测共识表
CREATE TABLE IF NOT EXISTS earnings_consensus (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,          -- 股票代码
  fiscal_year INTEGER NOT NULL,         -- 财年
  fiscal_quarter INTEGER,               -- 财季 (可为null表示全年)
  eps_consensus DECIMAL(10,2),          -- 分析师一致预期EPS
  eps_high DECIMAL(10,2),               -- 最高预期
  eps_low DECIMAL(10,2),                -- 最低预期
  revenue_consensus BIGINT,             -- 营收一致预期
  analyst_count INTEGER,                -- 覆盖分析师数量
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, fiscal_year, fiscal_quarter)
);

-- 7. 财报原文表
CREATE TABLE IF NOT EXISTS earnings_documents (
  id SERIAL PRIMARY KEY,
  earnings_id INTEGER REFERENCES earnings(id) ON DELETE CASCADE,
  source VARCHAR(50),                   -- sec_edgar, fmp, company_ir
  source_url TEXT,                      -- 来源链接
  document_type VARCHAR(20),            -- 10-K, 10-Q, 8-K, earnings_release
  filing_date DATE,                     -- 文件日期
  content JSONB,                        -- 原文内容 (结构化)
  raw_html_url TEXT,                    -- 原始HTML链接
  raw_pdf_url TEXT,                     -- PDF链接 (外部)
  page_count INTEGER,                   -- 页数
  word_count INTEGER,                   -- 字数
  language VARCHAR(10) DEFAULT 'en',    -- 语言
  ai_analysis_id INTEGER,               -- 关联AI分析
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(earnings_id)
);

-- 8. 原文访问日志表 (版权审计)
CREATE TABLE IF NOT EXISTS document_access_logs (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL,         -- 文档ID
  document_type VARCHAR(20) NOT NULL,   -- earnings, research
  user_id INTEGER,                      -- 用户ID (匿名为NULL)
  ip_address INET,                      -- IP地址
  access_type VARCHAR(20) NOT NULL,     -- view, download, share
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 创建索引
-- ============================================

-- company_valuation 索引
CREATE INDEX IF NOT EXISTS idx_valuation_company_id ON company_valuation(company_id);
CREATE INDEX IF NOT EXISTS idx_valuation_pe_ratio ON company_valuation(pe_ratio);
CREATE INDEX IF NOT EXISTS idx_valuation_updated ON company_valuation(updated_at);

-- industry_benchmarks 索引
CREATE INDEX IF NOT EXISTS idx_benchmark_sector ON industry_benchmarks(sector);
CREATE INDEX IF NOT EXISTS idx_benchmark_metric ON industry_benchmarks(metric_name);

-- peer_comparison 索引
CREATE INDEX IF NOT EXISTS idx_peer_company ON peer_comparison(company_id);
CREATE INDEX IF NOT EXISTS idx_peer_symbol ON peer_comparison(peer_symbol);
CREATE INDEX IF NOT EXISTS idx_peer_comparison_date ON peer_comparison(comparison_date);

-- research_reports 索引
CREATE INDEX IF NOT EXISTS idx_research_symbol ON research_reports(symbol);
CREATE INDEX IF NOT EXISTS idx_research_broker ON research_reports(broker);
CREATE INDEX IF NOT EXISTS idx_research_publish_date ON research_reports(publish_date);
CREATE INDEX IF NOT EXISTS idx_research_rating ON research_reports(rating);

-- analyst_tracking 索引
CREATE INDEX IF NOT EXISTS idx_analyst_name ON analyst_tracking(analyst_name);
CREATE INDEX IF NOT EXISTS idx_analyst_broker ON analyst_tracking(broker);
CREATE INDEX IF NOT EXISTS idx_analyst_accuracy ON analyst_tracking(accuracy_score);

-- earnings_consensus 索引
CREATE INDEX IF NOT EXISTS idx_consensus_symbol ON earnings_consensus(symbol);
CREATE INDEX IF NOT EXISTS idx_consensus_year ON earnings_consensus(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_consensus_updated ON earnings_consensus(updated_at);

-- earnings_documents 索引
CREATE INDEX IF NOT EXISTS idx_documents_earnings ON earnings_documents(earnings_id);
CREATE INDEX IF NOT EXISTS idx_documents_source ON earnings_documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_filing_date ON earnings_documents(filing_date);

-- document_access_logs 索引
CREATE INDEX IF NOT EXISTS idx_logs_document ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_accessed_at ON document_access_logs(accessed_at);

-- ============================================
-- 启用RLS (Row Level Security)
-- ============================================

ALTER TABLE company_valuation ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyst_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 创建公开读取策略
-- ============================================

DROP POLICY IF EXISTS "Allow public read access" ON company_valuation;
CREATE POLICY "Allow public read access" ON company_valuation
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON industry_benchmarks;
CREATE POLICY "Allow public read access" ON industry_benchmarks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON peer_comparison;
CREATE POLICY "Allow public read access" ON peer_comparison
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON research_reports;
CREATE POLICY "Allow public read access" ON research_reports
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON analyst_tracking;
CREATE POLICY "Allow public read access" ON analyst_tracking
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON earnings_consensus;
CREATE POLICY "Allow public read access" ON earnings_consensus
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON earnings_documents;
CREATE POLICY "Allow public read access" ON earnings_documents
  FOR SELECT USING (true);

-- 访问日志仅限管理员查看
DROP POLICY IF EXISTS "Allow public insert" ON document_access_logs;
CREATE POLICY "Allow public insert" ON document_access_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 初始数据插入
-- ============================================

-- 插入示例行业基准数据 (待实际数据填充)
INSERT INTO industry_benchmarks (sector, metric_name, avg_value, median_value) VALUES
  ('半导体', 'pe_ratio', 35.5, 32.0),
  ('软件服务', 'pe_ratio', 45.2, 42.0),
  ('互联网', 'pe_ratio', 28.3, 25.0),
  ('消费电子', 'pe_ratio', 25.8, 24.0),
  ('云计算', 'pe_ratio', 52.1, 48.0),
  ('网络安全', 'pe_ratio', 38.7, 36.0),
  ('数据服务', 'pe_ratio', 42.3, 40.0)
ON CONFLICT (sector, metric_name) DO NOTHING;

INSERT INTO industry_benchmarks (sector, metric_name, avg_value, median_value) VALUES
  ('半导体', 'roe', 15.2, 14.0),
  ('软件服务', 'roe', 12.8, 12.0),
  ('互联网', 'roe', 18.5, 17.0),
  ('消费电子', 'roe', 45.2, 48.0),
  ('云计算', 'roe', 8.5, 8.0),
  ('网络安全', 'roe', 10.2, 9.5),
  ('数据服务', 'roe', -5.2, -3.0)
ON CONFLICT (sector, metric_name) DO NOTHING;

-- ============================================
-- 注释说明
-- ============================================

COMMENT ON TABLE company_valuation IS '公司估值指标表，存储实时估值数据';
COMMENT ON TABLE industry_benchmarks IS '行业基准表，存储各行业平均估值指标';
COMMENT ON TABLE peer_comparison IS '竞争对比表，存储公司与同行的对比数据';
COMMENT ON TABLE research_reports IS '研报主表，存储券商研究报告信息';
COMMENT ON TABLE analyst_tracking IS '分析师追踪表，存储分析师历史表现';
COMMENT ON TABLE earnings_consensus IS '盈利预测共识表，存储分析师一致预期';
COMMENT ON TABLE earnings_documents IS '财报原文表，存储财报结构化内容';
COMMENT ON TABLE document_access_logs IS '原文访问日志表，用于版权审计';
