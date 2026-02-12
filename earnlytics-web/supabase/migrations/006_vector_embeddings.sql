-- Migration: AI Investment Assistant - Vector Embeddings Support
-- Phase 6: Week 7 - AI Investment Assistant Infrastructure

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Document embeddings table for RAG (Retrieval-Augmented Generation)
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source document reference
  source_type TEXT NOT NULL CHECK (source_type IN ('earnings', 'research_report', 'sec_filing', 'analysis', 'knowledge_base')),
  source_id UUID NOT NULL,
  
  -- Document metadata
  symbol TEXT NOT NULL,
  title TEXT NOT NULL,
  content_chunk TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  total_chunks INTEGER NOT NULL DEFAULT 1,
  
  -- Embedding vector (1536 dimensions for text-embedding-3-small)
  embedding vector(1536) NOT NULL,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_chunk UNIQUE (source_type, source_id, chunk_index)
);

-- Index for symbol-based queries
CREATE INDEX idx_document_embeddings_symbol ON document_embeddings(symbol);

-- Index for source type queries
CREATE INDEX idx_document_embeddings_source ON document_embeddings(source_type, source_id);

-- HNSW index for fast vector similarity search
CREATE INDEX idx_document_embeddings_embedding ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Conversation history for chat interface
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (null for anonymous users)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session tracking for anonymous users
  session_id TEXT,
  
  -- Conversation metadata
  title TEXT,
  symbol TEXT, -- Optional: specific company focus
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages within conversations
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to conversation
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- AI-specific fields
  model TEXT, -- Which model generated the response
  tokens_used INTEGER, -- Token count for cost tracking
  
  -- RAG sources referenced in this message
  sources JSONB DEFAULT '[]', -- Array of {source_type, source_id, title, similarity}
  
  -- Processing metadata
  processing_time_ms INTEGER, -- How long the response took
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for conversation messages
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);

-- Knowledge base articles for common investment questions
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Article metadata
  category TEXT NOT NULL CHECK (category IN ('investing_basics', 'financial_metrics', 'industry_analysis', 'market_strategy', 'risk_management')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  
  -- Content
  content TEXT NOT NULL,
  summary TEXT,
  
  -- Search metadata
  keywords TEXT[], -- Array of relevant keywords
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for knowledge base queries
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category) WHERE is_published = true;
CREATE INDEX idx_knowledge_base_slug ON knowledge_base(slug);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to perform similarity search on document embeddings
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  target_symbol TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id UUID,
  symbol TEXT,
  title TEXT,
  content_chunk TEXT,
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.source_type,
    de.source_id,
    de.symbol,
    de.title,
    de.content_chunk,
    1 - (de.embedding <=> query_embedding) AS similarity,
    de.metadata
  FROM document_embeddings de
  WHERE 
    (target_symbol IS NULL OR de.symbol = target_symbol)
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE document_embeddings IS 'Vector embeddings for RAG-based AI assistant';
COMMENT ON TABLE chat_conversations IS 'User chat conversation sessions';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat conversations';
COMMENT ON TABLE knowledge_base IS 'Curated investment knowledge articles';
COMMENT ON FUNCTION search_documents IS 'Performs cosine similarity search on document embeddings';

-- Add RLS policies for security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own conversations
CREATE POLICY user_conversations ON chat_conversations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can only see messages from their conversations
CREATE POLICY user_messages ON chat_messages
  FOR ALL
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE user_id = auth.uid()
    )
  );

-- Policy: Knowledge base is publicly readable
CREATE POLICY public_knowledge_base ON knowledge_base
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Insert sample knowledge base articles
INSERT INTO knowledge_base (category, title, slug, content, summary, keywords, is_published, published_at) VALUES
(
  'investing_basics',
  '如何阅读财报：投资者入门指南',
  'how-to-read-financial-statements',
  E'## 财报三大报表简介\n\n财报是了解一家公司的窗口，主要包括三大报表：\n\n### 1. 资产负债表 (Balance Sheet)\n- **资产**：公司拥有的资源\n- **负债**：公司欠的钱\n- **股东权益**：净资产 = 资产 - 负债\n\n### 2. 利润表 (Income Statement)\n- **营收**：公司卖产品/服务赚的收入\n- **成本**：生产产品的直接成本\n- **费用**：运营费用（研发、销售、管理）\n- **净利润**：最终赚的钱\n\n### 3. 现金流量表 (Cash Flow Statement)\n- **经营活动现金流**：主营业务产生的现金\n- **投资活动现金流**：购买资产、投资的现金\n- **筹资活动现金流**：借钱、还钱的现金\n\n## 关键指标解读\n\n### 盈利能力指标\n- **毛利率** = (营收 - 成本) / 营收 × 100%\n- **净利率** = 净利润 / 营收 × 100%\n- **ROE** = 净利润 / 股东权益 × 100%\n\n### 成长性指标\n- **营收增长率** = (本期营收 - 上期营收) / 上期营收 × 100%\n- **净利润增长率**：同上\n\n### 估值指标\n- **P/E (市盈率)** = 股价 / 每股收益\n- **P/B (市净率)** = 股价 / 每股净资产\n- **P/S (市销率)** = 市值 / 营收',
  '学习如何阅读资产负债表、利润表和现金流量表，掌握关键财务指标的含义',
  ARRAY['财报', '财务分析', '投资基础', '财务报表', '盈利能力'],
  true,
  NOW()
),
(
  'investing_basics',
  'P/E比率详解：如何正确使用市盈率',
  'pe-ratio-explained',
  E'## 什么是P/E比率？\n\n市盈率（Price-to-Earnings Ratio）是最常用的估值指标之一：\n\n```\nP/E = 股价 / 每股收益 (EPS)\n```\n\n它表示投资者愿意为每1元盈利支付多少钱。\n\n## P/E的类型\n\n### 1. 静态P/E (Trailing P/E)\n- 基于过去12个月的实际盈利\n- 优点是数据确定，缺点是滞后\n\n### 2. 动态P/E (Forward P/E)\n- 基于未来12个月的预测盈利\n- 反映市场预期，但存在预测误差\n\n## 如何使用P/E？\n\n### 同行业比较\n- 科技股的P/E通常高于银行股\n- 比较苹果 vs 微软，而不是苹果 vs 摩根大通\n\n### 历史比较\n- 与该公司5年历史P/E比较\n- 如果当前P/E处于历史低位，可能被低估\n\n### 结合增长率\n- PEG = P/E / 盈利增长率\n- PEG < 1 可能表示被低估\n\n## 注意事项\n\n1. **亏损公司没有P/E**\n2. **周期性行业P/E会大幅波动**\n3. **高P/E不一定贵，低P/E不一定便宜**\n4. **需要结合其他指标综合判断**',
  '深入理解市盈率的计算方法、类型以及在实际投资中的正确使用方式',
  ARRAY['市盈率', 'P/E', '估值', '财务指标', '投资分析'],
  true,
  NOW()
),
(
  'financial_metrics',
  'ROE杜邦分析法：拆解企业盈利能力',
  'roe-dupont-analysis',
  E'## 什么是ROE？\n\n净资产收益率（Return on Equity）是巴菲特最看重的指标之一：\n\n```\nROE = 净利润 / 股东权益 × 100%\n```\n\n它衡量公司为股东创造回报的能力。\n\n## 杜邦分析法\n\n杜邦分析法将ROE拆解为三个组成部分：\n\n```\nROE = 净利润率 × 资产周转率 × 权益乘数\n     = (净利润/营收) × (营收/总资产) × (总资产/股东权益)\n```\n\n### 1. 净利润率（盈利能力）\n- 反映公司产品定价能力和成本控制\n- 高利润率通常意味着强品牌或技术壁垒\n- 例子：软件公司通常有60%+的毛利率\n\n### 2. 资产周转率（运营效率）\n- 反映资产使用效率\n- 零售业通常周转率高（薄利多销）\n- 制造业周转率相对较低\n\n### 3. 权益乘数（财务杠杆）\n- 反映公司的负债水平\n- 杠杆高 = 风险大但潜在回报也高\n- 银行业天然高杠杆\n\n## 三种ROE模式\n\n| 模式 | 代表公司 | 特点 |\n|------|----------|------|\n| 高利润率型 | 苹果、茅台 | 品牌溢价，低周转 |\n| 高周转率型 | 沃尔玛、亚马逊零售 | 薄利多销，低毛利 |\n| 高杠杆型 | 银行、地产 | 资本密集，高风险 |\n\n## 优秀ROE的标准\n\n- **ROE > 15%**：优秀\n- **ROE > 20%**：卓越（可持续5年以上）\n- **ROE < 10%**：平庸\n\n注意：高ROE如果来自高杠杆，需要警惕风险。',
  '使用杜邦分析法深入理解ROE，学习如何通过三个维度评估企业盈利能力',
  ARRAY['ROE', '杜邦分析', '盈利能力', '财务杠杆', '资产周转率'],
  true,
  NOW()
),
(
  'industry_analysis',
  '科技股投资：如何分析护城河',
  'analyzing-tech-moats',
  E'## 什么是护城河？\n\n护城河（Economic Moat）是指公司抵御竞争的持久优势，由巴菲特提出。\n\n## 科技股的护城河类型\n\n### 1. 网络效应\n**定义**：用户越多，产品价值越大\n\n**典型公司**：\n- Meta（Facebook）：朋友都在用\n- 微信：社交网络锁定\n- Zoom：视频会议需要双方都用\n\n**评估要点**：\n- 是否存在双边/多边网络效应\n- 迁移成本有多高\n- 网络规模是否达到临界点\n\n### 2. 转换成本\n**定义**：客户切换到竞品的成本很高\n\n**典型公司**：\n- Salesforce：企业数据迁移困难\n- Oracle：数据库切换风险大\n- Apple：iCloud生态锁定\n\n**评估要点**：\n- 数据迁移难度\n- 员工培训成本\n- 系统整合复杂度\n\n### 3. 规模经济\n**定义**：规模越大，单位成本越低\n\n**典型公司**：\n- Amazon AWS：数据中心规模效应\n- TSMC：晶圆厂规模效应\n- Google：搜索基础设施\n\n**评估要点**：\n- 固定成本占比\n- 边际成本递减程度\n- CAPEX门槛\n\n### 4. 无形资产\n**品牌**：苹果、NVIDIA\n**专利**：制药、芯片公司\n**牌照**：电信、金融\n\n## 护城河的量化指标\n\n1. **毛利率**：高且稳定\n2. **ROIC**：持续高于WACC\n3. **市场份额**：长期保持领先\n4. **定价权**：能否提价而不流失客户\n\n## 护城河的变化\n\n⚠️ **警惕护城河侵蚀**：\n- 技术颠覆（柯达、诺基亚）\n- 监管变化（反垄断）\n- 消费者偏好转移',
  '学习如何识别和评估科技公司的四种护城河类型：网络效应、转换成本、规模经济和无形资产',
  ARRAY['护城河', '竞争优势', '科技股', '网络效应', '投资分析'],
  true,
  NOW()
),
(
  'risk_management',
  '分散投资：如何构建科技投资组合',
  'portfolio-diversification',
  E'## 为什么要分散投资？\n\n即使是最好的分析师也无法100%预测未来。分散投资可以降低单一公司/行业的风险。\n\n## 科技股投资组合构建\n\n### 1. 按市值分层\n\n| 层级 | 占比建议 | 特点 | 例子 |\n|------|----------|------|------|\n| 大盘科技股 | 40-50% | 稳定，流动性好 | AAPL, MSFT, GOOGL |\n| 中盘成长股 | 25-30% | 增长潜力大 | CRM, NOW, SNOW |\n| 小盘创新股 | 10-15% | 高风险高回报 | PLTR, DDOG, NET |\n\n### 2. 按子行业分散\n\n避免全部押注单一赛道：\n\n- **软件/SaaS**：MSFT, CRM, NOW\n- **半导体**：NVDA, AMD, AVGO\n- **互联网**：GOOGL, META, AMZN\n- **云服务**：AMZN, MSFT, GOOGL\n- **网络安全**：PANW, CRWD, ZS\n- **金融科技**：N/A (可在其他市场配置)\n\n### 3. 按地理位置分散\n\n- **美股科技股**：核心配置\n- **中国科技股**：通过港股/A股（如有配置）\n- **欧洲科技股**：ASML, SAP, Spotify\n\n## 仓位管理原则\n\n### 核心卫星策略\n- **核心仓位（60%）**：3-5只大盘科技股\n- **卫星仓位（40%）**：8-12只主题/趋势股\n\n### 单只股票上限\n- 个股不超过投资组合的15%\n- 单个子行业不超过30%\n\n### 动态再平衡\n- 每季度检查一次权重\n- 涨幅过大的股票适当减仓\n- 补充被低估的标的\n\n## 风险管理清单\n\n- [ ] 是否过度集中单一公司？\n- [ ] 是否过度集中单一行业？\n- [ ] 是否有足够的现金流缓冲？\n- [ ] 是否设置了止损/止盈点？\n- [ ] 是否定期检视投资组合？',
  '学习如何构建一个风险分散的科技股投资组合，包括市值分层、行业分散和仓位管理策略',
  ARRAY['投资组合', '分散投资', '风险管理', '仓位管理', '科技股'],
  true,
  NOW()
);

-- Grant permissions to service role
GRANT ALL ON document_embeddings TO service_role;
GRANT ALL ON chat_conversations TO service_role;
GRANT ALL ON chat_messages TO service_role;
GRANT ALL ON knowledge_base TO service_role;
GRANT EXECUTE ON FUNCTION search_documents TO service_role;
