# Plan 2 部署指南 - AI自动化部署步骤

## 概述
本文档详细说明如何配置环境变量并部署 Plan 2: AI自动化功能。

---

## 前置条件

- Plan 1 (MVP) 已成功部署到 Vercel
- 拥有 Supabase 项目访问权限
- 拥有 GitHub 仓库管理权限
- 所有 API 密钥已准备（见 `计划2所需.md`）

---

## 步骤 1: 在 Supabase 执行数据库迁移

### 1.1 访问 Supabase 控制台
1. 打开 https://supabase.com/dashboard
2. 登录并进入项目 `sdbdvtnhidifpdtyziwu`

### 1.2 创建数据库表
1. 点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制并执行以下 SQL:

```sql
-- ============================================
-- Earnlytics Database Schema - Plan 2
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
```

### 1.3 验证数据插入
执行以下查询确认公司数据已插入:
```sql
SELECT * FROM companies ORDER BY symbol;
```
应该显示10家公司记录。

---

## 步骤 2: 配置 Vercel 环境变量

### 2.1 访问 Vercel Dashboard
1. 打开 https://vercel.com/dashboard
2. 进入 `earnlytics` 项目

### 2.2 添加环境变量
1. 点击 **Settings** → **Environment Variables**
2. 逐个添加以下变量:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sdbdvtnhidifpdtyziwu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYmR2dG5oaWRpZnBkdHl6aXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTMyNjksImV4cCI6MjA4NjAyOTI2OX0.qqwH4ObruEroG6NOIVk1b_yC_wpsaDGMl21We5dHT0M` |
| `DEEPSEEK_API_KEY` | `sk-eb9bd37f772141e2a55a5ace60a4ce66` |
| `FMP_API_KEY` | `KAsCR02pUvLLqfyLnt1llUq5vuq8vUuG` |

3. 点击 **Save**

### 2.3 重新部署
1. 进入 **Deployments** 页面
2. 找到最新部署，点击右侧的三个点 **...**
3. 选择 **Redeploy**

---

## 步骤 3: 配置 GitHub Secrets

### 3.1 访问 GitHub Secrets 页面
1. 打开 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**

### 3.2 添加 Secrets

逐个添加以下 secrets:

#### Secret 1: DEEPSEEK_API_KEY
- **Name:** `DEEPSEEK_API_KEY`
- **Value:** `sk-eb9bd37f772141e2a55a5ace60a4ce66`

#### Secret 2: DEEPSEEK_API_URL
- **Name:** `DEEPSEEK_API_URL`
- **Value:** `https://api.deepseek.com/v1/chat/completions`

#### Secret 3: FMP_API_KEY
- **Name:** `FMP_API_KEY`
- **Value:** `KAsCR02pUvLLqfyLnt1llUq5vuq8vUuG`

#### Secret 4: NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://sdbdvtnhidifpdtyziwu.supabase.co`

#### Secret 5: SUPABASE_SERVICE_ROLE_KEY
**获取方法:**
1. 在 Supabase Dashboard → Project Settings → API
2. 找到 `service_role` key（注意: 不是 `anon` key）
3. 复制并添加为 Secret

- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** *(你的 service_role key)*

#### Secret 6: VERCEL_DEPLOY_HOOK
**获取方法:**
1. 在 Vercel Dashboard → Project Settings → Git → Deploy Hooks
2. 点击 **Create Hook**
3. **Name:** `production-deploy`
4. **Branch:** `main`
5. 复制生成的 URL

- **Name:** `VERCEL_DEPLOY_HOOK`
- **Value:** *(你的 deploy hook URL)*

---

## 步骤 4: 本地首次数据填充（推荐）

本步骤提供两种方法填充数据：**方法A（推荐）**直接在Supabase执行SQL，**方法B**使用本地脚本获取。

---

### 方法A：直接执行SQL插入测试数据（最快2分钟）

这是最快的方法，直接插入真实的财报数据到数据库。

#### 4.1.1 打开 Supabase SQL Editor
1. 访问 https://supabase.com/dashboard
2. 进入项目 `sdbdvtnhidifpdtyziwu`
3. 点击左侧 **SQL Editor**
4. 点击 **New query**

#### 4.1.2 执行插入语句
复制并执行以下SQL：

```sql
-- 插入测试财报数据（每家公司2-3条）
INSERT INTO earnings (company_id, fiscal_year, fiscal_quarter, report_date, revenue, net_income, eps, eps_estimate, eps_surprise, is_analyzed) VALUES
  -- Apple
  (1, 2024, 4, '2024-10-30', 94930000000, 14730000000, 1.64, 1.60, 0.04, false),
  (1, 2024, 3, '2024-08-01', 85780000000, 21450000000, 1.40, 1.35, 0.05, false),
  (1, 2024, 2, '2024-05-02', 90753000000, 23636000000, 1.53, 1.50, 0.03, false),
  -- Microsoft
  (2, 2025, 1, '2024-10-24', 65585000000, 24667000000, 3.30, 3.10, 0.20, false),
  (2, 2024, 4, '2024-07-30', 64727000000, 22036000000, 2.95, 2.93, 0.02, false),
  (2, 2024, 3, '2024-04-25', 61858000000, 21939000000, 2.94, 2.82, 0.12, false),
  -- Alphabet
  (3, 2024, 3, '2024-10-29', 88268000000, 26301000000, 2.12, 1.85, 0.27, false),
  (3, 2024, 2, '2024-07-23', 84742000000, 23619000000, 1.89, 1.84, 0.05, false),
  -- NVIDIA
  (4, 2025, 3, '2024-11-20', 35082000000, 19309000000, 0.78, 0.74, 0.04, false),
  (4, 2025, 2, '2024-08-28', 30040000000, 16599000000, 0.67, 0.64, 0.03, false),
  (4, 2025, 1, '2024-05-22', 26044000000, 14881000000, 0.60, 0.52, 0.08, false),
  -- Meta
  (5, 2024, 3, '2024-10-30', 40589000000, 15688000000, 6.03, 5.25, 0.78, false),
  (5, 2024, 2, '2024-07-31', 39071000000, 13465000000, 5.16, 4.74, 0.42, false),
  -- Amazon
  (6, 2024, 3, '2024-10-31', 158880000000, 10124000000, 1.43, 1.14, 0.29, false),
  (6, 2024, 2, '2024-08-01', 148000000000, 13485000000, 1.26, 1.03, 0.23, false),
  -- Tesla
  (7, 2024, 3, '2024-10-23', 25183000000, 2167000000, 0.72, 0.58, 0.14, false),
  (7, 2024, 2, '2024-07-23', 24927000000, 1478000000, 0.52, 0.62, -0.10, false),
  -- AMD
  (8, 2024, 3, '2024-10-29', 6813000000, 772000000, 0.47, 0.46, 0.01, false),
  (8, 2024, 2, '2024-07-30', 5835000000, 265000000, 0.16, 0.17, -0.01, false),
  -- Netflix
  (9, 2024, 3, '2024-10-17', 9825000000, 2339000000, 5.40, 5.12, 0.28, false),
  (9, 2024, 2, '2024-07-18', 9506000000, 2141000000, 4.88, 4.74, 0.14, false),
  -- Salesforce
  (10, 2025, 2, '2024-08-28', 9300000000, 1431000000, 1.47, 1.36, 0.11, false),
  (10, 2025, 1, '2024-05-29', 9133000000, 1538000000, 1.58, 1.36, 0.22, false)
ON CONFLICT (company_id, fiscal_year, fiscal_quarter) DO NOTHING;
```

#### 4.1.3 验证数据插入成功
执行以下查询检查：

```sql
-- 检查财报总数
SELECT COUNT(*) as total_earnings FROM earnings;

-- 查看每家公司的财报数量
SELECT 
  c.symbol,
  c.name,
  COUNT(e.id) as earnings_count
FROM companies c
LEFT JOIN earnings e ON c.id = e.company_id
GROUP BY c.id, c.symbol, c.name
ORDER BY earnings_count DESC;
```

**预期结果：**
- `total_earnings` 应该显示 **26** 条记录
- 每家公司应该有 2-3 条财报记录

✅ **完成！** 现在跳过4.2-4.3，直接进行 **4.4 运行AI分析**

---

### 方法B：使用本地脚本获取数据（可选）

如果你想从FMP API实时获取最新数据，使用此方法。

#### 4.2.1 进入项目目录
```bash
cd /Users/justin/Desktop/earnlytics/earnlytics-web
```

#### 4.2.2 创建本地环境变量文件
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://sdbdvtnhidifpdtyziwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYmR2dG5oaWRpZnBkdHl6aXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTMyNjksImV4cCI6MjA4NjAyOTI2OX0.qqwH4ObruEroG6NOIVk1b_yC_wpsaDGMl21We5dHT0M
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
FMP_API_KEY=KAsCR02pUvLLqfyLnt1llUq5vuq8vUuG
DEEPSEEK_API_KEY=sk-eb9bd37f772141e2a55a5ace60a4ce66
EOF
```

**注意:** 将 `你的_service_role_key` 替换为实际的 service_role key

#### 4.2.3 获取财报数据
```bash
npm run fetch:earnings
```

预期输出:
```
Starting earnings fetch...
Fetching data for AAPL...
  Stored: AAPL FY2024 Q1
  Stored: AAPL FY2024 Q2
...
=== Fetch Summary ===
New/Updated earnings: XX
Errors: 0
```

**常见问题：**
- 如果输出 `0 earnings`，可能是FMP API暂时不可用，使用方法A的SQL插入即可

---

### 4.4 运行AI分析（生成中文分析）

无论你使用方法A还是B，都需要执行此步骤生成AI分析。

#### 4.4.1 运行分析脚本
```bash
npm run analyze:batch
```

预期输出:
```
Starting batch analysis...
Found X earnings to analyze
Analyzing AAPL FY2024 Q4...
  ✓ Analysis saved (1250 tokens, $0.001250)
  Sentiment: positive
Analyzing MSFT FY2025 Q1...
  ✓ Analysis saved (1320 tokens, $0.001320)
  Sentiment: positive
...
=== Analysis Summary ===
Analyzed: 5/X
Total cost: $0.00XXXX USD
```

#### 4.4.2 继续分析剩余财报
每次脚本最多分析5条，如果有更多未分析的财报，重复运行：
```bash
npm run analyze:batch
```

建议运行 **5-6次** 直到所有财报都被分析（约30条财报）。

#### 4.4.3 验证AI分析已生成
在Supabase SQL Editor执行：
```sql
-- 检查AI分析数量
SELECT COUNT(*) as total_analyses FROM ai_analyses;

-- 查看分析详情
SELECT 
  c.symbol,
  e.fiscal_year,
  e.fiscal_quarter,
  a.sentiment,
  LEFT(a.summary, 50) as summary_preview
FROM ai_analyses a
JOIN earnings e ON a.earnings_id = e.id
JOIN companies c ON e.company_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;
```

**预期结果：**
- `total_analyses` 应该显示 **5+** 条记录
- 每次运行脚本会增加最多5条
- `sentiment` 列显示 positive/neutral/negative

---

### 4.5 数据填充完成检查清单

完成以下验证：

- [ ] **companies表**: 执行 `SELECT COUNT(*) FROM companies;` → 结果应为 **10**
- [ ] **earnings表**: 执行 `SELECT COUNT(*) FROM earnings;` → 结果应为 **20+**
- [ ] **ai_analyses表**: 执行 `SELECT COUNT(*) FROM ai_analyses;` → 结果应为 **5+**
- [ ] **网站公司页**: 访问 `/companies` → 显示10家公司卡片
- [ ] **网站财报页**: 访问 `/earnings/aapl` → 显示Apple财报和AI分析

---

### 4.6 故障排除

#### 问题1: earnings表为空（使用方法A后）
**症状**: 执行SQL后 `SELECT COUNT(*) FROM earnings;` 返回0

**解决**:
1. 检查SQL是否执行成功（有无错误消息）
2. 检查companies表是否有数据：`SELECT * FROM companies;`
3. 如果companies为空，先执行步骤1的SQL创建公司和基础数据
4. 手动插入单条测试：
```sql
INSERT INTO earnings (company_id, fiscal_year, fiscal_quarter, report_date, revenue, net_income, eps, is_analyzed) 
VALUES (1, 2024, 4, '2024-10-30', 94930000000, 14730000000, 1.64, false);
```

#### 问题2: npm run fetch:earnings 报错
**症状**: 脚本运行失败或返回0条数据

**解决**:
1. 检查 `.env.local` 文件是否存在且包含正确的密钥
2. 检查FMP API是否可用（有时会有临时问题）
3. 直接使用方法A的SQL插入数据即可

#### 问题3: npm run analyze:batch 报错
**症状**: AI分析脚本失败

**解决**:
1. 检查 `.env.local` 中的 `DEEPSEEK_API_KEY` 是否正确
2. 检查DeepSeek账户是否有余额：https://platform.deepseek.com
3. 检查Supabase连接是否正常

#### 问题4: 网站显示"AI分析正在生成中"
**症状**: 财报详情页没有显示AI分析内容

**解决**:
1. 确认已运行 `npm run analyze:batch`
2. 在Supabase检查ai_analyses表是否有数据
3. 检查对应公司的is_analyzed字段是否为true

---

**完成步骤4后，进入步骤5：验证部署**

---

## 步骤 5: 验证部署

### 5.1 检查公司列表页
访问: `https://earnlytics-ebon.vercel.app/companies`

**预期结果:** 显示10家公司卡片 (AAPL, MSFT, GOOGL, NVDA, META, AMZN, TSLA, AMD, NFLX, CRM)

### 5.2 检查财报详情页
访问: `https://earnlytics-ebon.vercel.app/earnings/aapl`

**预期结果:**
- 显示 Apple Inc. 的基本信息
- 显示最新财报数据 (营收、EPS、净利润等)
- 显示 AI 分析摘要、核心亮点、关注点

### 5.3 检查数据库状态
在 Supabase SQL Editor 执行:
```sql
-- 检查财报数量
SELECT COUNT(*) FROM earnings;

-- 检查AI分析数量
SELECT COUNT(*) FROM ai_analyses;

-- 查看最新财报
SELECT 
  c.symbol, 
  c.name, 
  e.fiscal_year, 
  e.fiscal_quarter, 
  e.report_date, 
  e.is_analyzed
FROM earnings e
JOIN companies c ON e.company_id = c.id
ORDER BY e.report_date DESC
LIMIT 10;
```

---

## 步骤 6: 测试自动化流程

### 6.1 手动触发 GitHub Actions
1. 打开 GitHub 仓库 → **Actions** 标签
2. 点击左侧 **Update Earnings Data**
3. 点击右侧 **Run workflow** → **Run workflow**
4. 等待工作流完成（约2-3分钟）

### 6.2 检查工作流状态
- **绿色勾选:** 成功
- **红色叉号:** 失败，查看日志排查问题

### 6.3 验证自动部署
1. 工作流成功后，访问 Vercel Dashboard
2. 检查是否自动触发了新的部署
3. 等待部署完成后刷新网站查看数据更新

---

## 故障排除

### 问题 1: GitHub Actions 失败
**症状:** Actions 页面显示红色叉号

**排查:**
1. 点击失败的 workflow
2. 查看具体步骤的日志
3. 常见原因:
   - Secrets 配置错误 → 检查所有 Secrets 是否正确
   - API 密钥无效 → 验证 DEEPSEEK_API_KEY 和 FMP_API_KEY

### 问题 2: API 返回 500 错误
**症状:** 网站显示 "Internal Server Error"

**排查:**
1. 检查 Vercel Functions 日志
2. 确认环境变量已正确设置
3. 确认 Supabase 表已创建

### 问题 3: AI 分析未生成
**症状:** 财报详情页显示 "AI 分析正在生成中"

**排查:**
1. 检查 DeepSeek API 余额: https://platform.deepseek.com
2. 手动运行 `npm run analyze:batch` 查看错误
3. 检查 Supabase 中 `is_analyzed` 字段状态

### 问题 4: 数据未自动更新
**症状:** 新财报发布后网站未更新

**排查:**
1. 检查 GitHub Actions 是否按计划运行（每4小时）
2. 检查 FMP API 是否返回新数据
3. 检查 Vercel Deploy Hook 是否正确配置

---

## 成本估算

| 项目 | 数量/月 | 单价 | 月成本 |
|------|---------|------|--------|
| DeepSeek API | ~50次分析 | ¥0.002/千tokens | ~¥0.2 |
| FMP API | 免费额度 | 免费 | ¥0 |
| Supabase | 免费额度 | 免费 | ¥0 |
| Vercel | 免费额度 | 免费 | ¥0 |
| GitHub Actions | 免费额度 | 免费 | ¥0 |
| **总计** | | | **~¥0.2** |

---

## 后续维护

### 定期检查清单
- [ ] 每周检查 GitHub Actions 运行状态
- [ ] 每月检查 DeepSeek API 使用情况
- [ ] 每月检查 Supabase 数据库大小
- [ ] 季度检查 FMP API 调用限制

### 添加更多公司
如需扩展到30家公司:
1. 在 Supabase 执行:
```sql
INSERT INTO companies (symbol, name, sector) VALUES
  ('INTC', 'Intel Corporation', '芯片'),
  ('ADBE', 'Adobe Inc.', '软件'),
  ('ORCL', 'Oracle Corporation', '软件');
```
2. 更新 `scripts/fetch-earnings.ts` 中的 `SYMBOLS` 数组
3. 重新运行数据获取脚本

---

## 完成标志

✅ **Supabase** - 数据库表创建完成，10家公司数据已插入  
✅ **Vercel** - 环境变量配置完成，网站正常访问  
✅ **GitHub** - Secrets 配置完成，Actions 工作流正常运行  
✅ **数据** - 财报数据已填充，AI分析已生成  
✅ **自动化** - 每4小时自动更新流程已启用  

---

**部署完成后，进入 Plan 3: 规模化阶段！** 🚀
