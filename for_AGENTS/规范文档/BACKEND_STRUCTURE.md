# 后端架构规范

**更新日期:** 2026-02-27  
**适用范围:** earnlytics-web 后端系统

---

## 概述

Earnlytics 采用 Serverless 架构，基于 Next.js 16 App Router 的 API Routes 实现后端功能，数据存储在 Supabase PostgreSQL。

## 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js (Vercel Serverless) | 20.x |
| 框架 | Next.js App Router | 16.x |
| 数据库 | Supabase PostgreSQL | - |
| AI 服务 | DeepSeek API | - |
| 数据源 | Financial Modeling Prep (FMP) | - |
| 自动化 | GitHub Actions | - |

---

## 目录结构

> 注：以下为后端路由能力示意结构，实际代码结构以 `earnlytics-web/src/app/api` 当前目录为准。

```
src/app/api/
├── auth/
│   ├── login/route.ts          # 用户登录
│   └── signup/route.ts         # 用户注册
├── earnings/
│   ├── route.ts                # 财报列表
│   └── [id]/
│       ├── route.ts            # 单条财报
│       └── document/route.ts   # 财报原文
├── companies/route.ts          # 公司列表
├── analysis/[symbol]/route.ts  # AI 分析
├── subscribe/route.ts          # 邮件订阅
├── alerts/route.ts             # 警报管理
├── calendar/route.ts           # 财报日历
├── health/route.ts             # 健康检查
└── ...
```

---

## 数据库架构

### 核心表结构

#### 1. companies (公司表)
```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,  -- 股票代码
  name VARCHAR(100) NOT NULL,          -- 公司名称
  sector VARCHAR(50),                  -- 行业
  logo_url VARCHAR(255),               -- Logo URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. earnings (财报表)
```sql
CREATE TABLE earnings (
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
```

#### 3. ai_analyses (AI分析表)
```sql
CREATE TABLE ai_analyses (
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
```

#### 4. users (用户表)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. alert_rules (警报规则表)
```sql
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT,
  rule_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  notification_channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. user_portfolios (用户持仓表)
```sql
CREATE TABLE user_portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL REFERENCES companies(symbol),
  shares DECIMAL(12,4) NOT NULL DEFAULT 0,
  avg_cost_basis DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);
```

#### 7. user_transactions (用户交易记录表)
```sql
CREATE TABLE user_transactions (
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
```

#### 8. portfolio_history (持仓历史净值表)
```sql
CREATE TABLE portfolio_history (
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
```

#### 9. portfolio_briefings (AI简报表)
```sql
CREATE TABLE portfolio_briefings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  sentiment VARCHAR(20) NOT NULL DEFAULT 'neutral',
  highlights JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  total_value DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_change_pct DECIMAL(8,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);
```

### 数据库索引

```sql
CREATE INDEX idx_earnings_company_id ON earnings(company_id);
CREATE INDEX idx_earnings_report_date ON earnings(report_date);
CREATE INDEX idx_earnings_is_analyzed ON earnings(is_analyzed);
CREATE INDEX idx_companies_sector ON companies(sector);
```

### RLS 策略

所有表启用 Row Level Security，公开数据使用公开读取策略。

---

## API 接口规范

### API 路由列表

#### 公司相关
| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/companies` | GET | 获取公司列表 (支持分页、筛选) |
| `/api/companies/[symbol]` | GET | 获取单个公司详情 |

#### 财报相关
| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/earnings` | GET | 获取财报列表 (支持筛选、排序) |
| `/api/earnings/[id]` | GET | 获取单条财报详情 |
| `/api/earnings/[id]/document` | GET | 获取财报原文 |

#### 投资分析
| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/analysis/[symbol]` | GET | 获取AI分析报告 |
| `/api/valuation/[symbol]` | GET | 获取估值数据 |
| `/api/peers/[symbol]` | GET | 获取同行对比数据 |
| `/api/sectors` | GET | 获取行业基准数据 |
| `/api/research/[symbol]` | GET | 获取研究报告 |

#### 用户相关
| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/signup` | POST | 用户注册 |
| `/api/subscribe` | POST | 邮件订阅 |
| `/api/alerts` | GET/POST | 获取/创建预警规则 |
| `/api/feedback` | POST | 提交反馈 |

#### 持仓相关
| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/portfolio` | GET | 获取用户持仓列表 |
| `/api/portfolio` | POST | 添加持仓 |
| `/api/portfolio` | DELETE | 删除持仓 |
| `/api/portfolio/history` | GET | 获取历史净值 |
| `/api/portfolio/history` | POST | 记录当日净值 |
| `/api/portfolio/earnings` | GET | 获取持仓公司财报日历 |
| `/api/portfolio/briefing` | GET | 获取AI简报 |
| `/api/portfolio/briefing` | POST | 生成AI简报 |

#### 其他
| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/calendar` | GET | 获取财报日历 |
| `/api/health` | GET | 健康检查 |
| `/api/market-ticker` | GET | 获取市场行情（含短缓存 + ETag/304） |
| `/api/web-vitals` | POST | 接收前端 Web Vitals 指标 |
| `/api/web-vitals` | GET | 返回按 path+metric 聚合的指标摘要 |

### 性能相关后端约定 (2026-02-27)

- `/api/market-ticker`
  - 应返回 `Cache-Control` 与 `ETag`
  - 支持 `If-None-Match` 命中后返回 `304`
  - 允许短时进程内缓存（当前实现: 30 秒）
- `/api/web-vitals`
  - `POST` 仅接收必要字段：`name`, `value`, `path`, `ts`
  - `GET` 返回聚合统计（建议包含 `count/avg/p75`）

### 响应格式

#### 成功响应示例

```typescript
// 公司列表
{
  "companies": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "market_cap": 2800000000000
    }
  ],
  "total": 30
}

// 财报详情
{
  "id": 123,
  "symbol": "AAPL",
  "fiscal_year": 2024,
  "fiscal_quarter": 4,
  "report_date": "2024-10-30",
  "revenue": 89400000000,
  "revenue_yoy_growth": 6.1,
  "eps": 1.64,
  "eps_estimate": 1.60,
  "eps_surprise": 2.5,
  "analysis": {
    "summary": "苹果Q4财报超出预期...",
    "sentiment": "positive",
    "highlights": ["iPhone销量增长", "服务收入创新高"],
    "concerns": ["中国市场增长放缓"]
  }
}

// 估值数据
{
  "symbol": "AAPL",
  "current": {
    "peRatio": 28.5,
    "pbRatio": 8.2,
    "psRatio": 7.1,
    "roe": 25.5
  },
  "historical": {
    "pePercentile": 65,
    "pbPercentile": 70
  },
  "benchmark": {
    "sector": "Technology",
    "peRatioMedian": 25.0
  }
}
```

#### 错误响应格式

```typescript
// 标准错误
{
  "error": "Company not found",
  "status": 404
}

// 验证错误
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}

// 服务器错误
{
  "error": "Internal server error",
  "status": 500,
  "requestId": "uuid-for-debugging"
}
```

### API 错误码

| 状态码 | 场景 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 重新登录 |
| 404 | 资源不存在 | 检查symbol是否正确 |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 服务器错误 | 稍后重试或联系支持 |

---

## AI 服务集成

### DeepSeek 配置

```typescript
const SYSTEM_PROMPT = `你是一个专业的财务分析师...`

export async function analyzeEarnings(earning: EarningWithCompany) {
  // 调用 DeepSeek API
}
```

### 分析结果结构

```typescript
type AIAnalysisResult = {
  summary: string              // 中文摘要
  highlights: string[]         // 亮点列表
  concerns: string[]           // 关注点列表
  sentiment: 'positive' | 'neutral' | 'negative'
}
```

---

## 数据脚本

| 脚本 | 命令 | 用途 |
|------|------|------|
| fetch-earnings.ts | `npm run fetch:earnings` | 获取最新财报 |
| analyze-batch.ts | `npm run analyze:batch` | 批量AI分析 |
| process-alerts.ts | `npm run alerts:process` | 处理预警 |

---

## 环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# AI Service
DEEPSEEK_API_KEY=your-key

# Data Source
FMP_API_KEY=your-key
```

---

## 开发规范

### 必须遵守
- ✅ API 返回统一 JSON 格式
- ✅ 使用 Zod 验证数据
- ✅ 敏感操作验证用户身份
- ✅ 错误记录日志

### 禁止操作
- ❌ 硬编码 API 密钥
- ❌ 使用 `as any` 或 `@ts-ignore`
- ❌ 客户端暴露服务端密钥

---

**相关文档:**
- [前端规范](./FRONTED_GUIDELINES.md)
- [应用流程](./APP_FLOW.md)
- [实施指南](./IMPLEMENTATION.md)

---

## 附录 A: API 端点详细合约

### A.1 公司相关 API

#### GET /api/companies

**描述:** 获取公司列表 (支持分页和筛选)

**请求参数:**
```typescript
interface QueryParams {
  sector?: string;        // 行业筛选
  search?: string;        // 搜索关键词
  page?: number;          // 页码 (默认 1)
  limit?: number;         // 每页数量 (默认 20, 最大 100)
  sortBy?: 'name' | 'marketCap' | 'peRatio'; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}
```

**响应格式:**
```typescript
interface CompaniesResponse {
  companies: Array<{
    id: number;
    symbol: string;
    name: string;
    sector: string;
    industry: string;
    marketCap: number;
    logoUrl?: string;
    latestEarningsDate?: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**示例响应:**
```json
{
  "companies": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "industry": "Consumer Electronics",
      "marketCap": 2800000000000,
      "logoUrl": "https://...",
      "latestEarningsDate": "2024-10-30"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

**错误响应:**
```json
{
  "error": "Invalid sort field",
  "status": 400
}
```

---

#### GET /api/companies/[symbol]

**描述:** 获取单个公司详情

**路径参数:**
- `symbol`: 股票代码 (如 AAPL)

**响应格式:**
```typescript
interface CompanyDetailResponse {
  id: number;
  symbol: string;
  name: string;
  description?: string;
  sector: string;
  industry: string;
  website?: string;
  marketCap: number;
  employees?: number;
  founded?: number;
  logoUrl?: string;
  latestValuation?: {
    peRatio: number;
    pbRatio: number;
    psRatio: number;
    roe: number;
    updatedAt: string;
  };
  upcomingEarnings?: {
    date: string;
    fiscalQuarter: string;
    isConfirmed: boolean;
  };
}
```

**错误码:**
- 404: 公司不存在
- 400: symbol 格式无效

---

### A.2 财报相关 API

#### GET /api/earnings

**描述:** 获取财报列表

**请求参数:**
```typescript
interface QueryParams {
  symbol?: string;        // 特定公司
  startDate?: string;     // 开始日期 (YYYY-MM-DD)
  endDate?: string;       // 结束日期 (YYYY-MM-DD)
  fiscalYear?: number;    // 财年
  isAnalyzed?: boolean;   // 是否已分析
  page?: number;
  limit?: number;
}
```

**响应格式:**
```typescript
interface EarningsListResponse {
  earnings: Array<{
    id: number;
    symbol: string;
    companyName: string;
    fiscalYear: number;
    fiscalQuarter: number;
    reportDate: string;
    revenue: number;
    revenueYoYGrowth: number;
    eps: number;
    epsEstimate: number;
    epsSurprise: number;
    isAnalyzed: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
```

---

#### GET /api/earnings/[id]

**描述:** 获取单条财报详情

**响应格式:**
```typescript
interface EarningDetailResponse {
  id: number;
  symbol: string;
  company: {
    name: string;
    sector: string;
  };
  fiscalYear: number;
  fiscalQuarter: number;
  reportDate: string;
  revenue: number;
  revenueYoYGrowth: number;
  revenueQoQGrowth: number;
  eps: number;
  epsEstimate: number;
  epsSurprise: number;
  epsSurprisePercent: number;
  netIncome: number;
  operatingIncome: number;
  grossProfit: number;
  operatingMargin: number;
  netMargin: number;
  analysis?: {
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    highlights: string[];
    concerns: string[];
    keyMetrics: Array<{
      name: string;
      value: string;
      trend: 'up' | 'down' | 'flat';
    }>;
  };
  historicalContext?: {
    beatEstimate: boolean;
    revenueGrowthTrend: string;
    epsGrowthTrend: string;
  };
}
```

---

### A.3 投资分析 API

#### GET /api/valuation/[symbol]

**描述:** 获取公司估值数据

**响应格式:**
```typescript
interface ValuationResponse {
  symbol: string;
  company: {
    name: string;
    sector: string;
    industry: string;
  };
  current: {
    marketCap: number;
    enterpriseValue: number;
    peRatio: number;
    forwardPE: number;
    pegRatio: number;
    pbRatio: number;
    psRatio: number;
    evEbitda: number;
    evSales: number;
    roe: number;
    roa: number;
    roic: number;
    priceToFcf: number;
  };
  historical: {
    pePercentile: number;   // PE 历史百分位
    pbPercentile: number;   // PB 历史百分位
    psPercentile: number;   // PS 历史百分位
    historicalPEs: number[]; // 最近30个PE值
    historicalPBs: number[];
    historicalPSs: number[];
  };
  benchmark: {
    sector: string;
    industry: string;
    peRatioMedian: number;
    peRatioMean: number;
    pbRatioMedian: number;
    psRatioMedian: number;
    evEbitdaMedian: number;
    roeMedian: number;
  } | null;
  assessment: 'undervalued' | 'fair' | 'overvalued' | 'unknown';
  updatedAt: string;
}
```

**错误码:**
- 404: 公司不存在或暂无估值数据
- 500: 计算错误

---

#### GET /api/peers/[symbol]

**描述:** 获取同行对比数据

**响应格式:**
```typescript
interface PeersResponse {
  symbol: string;
  company: {
    name: string;
    sector: string;
    industry: string;
  };
  current: {
    marketCap: number;
    peRatio: number;
    pbRatio: number;
    psRatio: number;
    roe: number;
    roa: number;
  };
  peers: Array<{
    symbol: string;
    name: string;
    marketCap: number;
    peRatio?: number;
    pbRatio?: number;
    psRatio?: number;
    roe?: number;
    roa?: number;
  }>;
  rankings: {
    peRatio: { rank: number; total: number; percentile: number };
    pbRatio: { rank: number; total: number; percentile: number };
    psRatio: { rank: number; total: number; percentile: number };
    roe: { rank: number; total: number; percentile: number };
    roa: { rank: number; total: number; percentile: number };
  };
}
```

---

#### GET /api/sectors

**描述:** 获取行业基准数据

**请求参数:**
```typescript
interface QueryParams {
  sector?: string;  // 筛选特定行业
}
```

**响应格式:**
```typescript
interface SectorsResponse {
  sectors: Array<{
    name: string;
    industryCount: number;
    totalCompanies: number;
    avgMetrics: {
      peRatio: number | null;
      pbRatio: number | null;
      psRatio: number | null;
    };
  }>;
  totalSectors: number;
  totalCompanies: number;
}
```

**带 sector 参数的响应 (单个行业详情):**
```typescript
interface SectorDetailResponse {
  name: string;
  industryCount: number;
  totalCompanies: number;
  avgMetrics: {
    peRatio: number;
    pbRatio: number;
    psRatio: number;
  };
  industries: Array<{
    name: string;
    companyCount: number;
    metrics: {
      peRatio: number;
      pbRatio: number;
      psRatio: number;
      roe: number;
      roa: number;
    };
  }>;
}
```

---

### A.4 用户相关 API

#### POST /api/auth/signup

**描述:** 用户注册

**请求体:**
```typescript
interface SignupRequest {
  email: string;      // 邮箱格式验证
  password: string;   // 至少8位，包含字母和数字
  name?: string;      // 可选，用户名
}
```

**响应:**
```typescript
// 成功 (201)
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "用户名"
  },
  "message": "注册成功，请登录"
}

// 失败 (409)
{
  "error": "该邮箱已注册",
  "suggestion": "直接登录或找回密码"
}
```

---

#### POST /api/auth/login

**描述:** 用户登录

**请求体:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**响应:**
```typescript
// 成功 (200)
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "用户名"
  },
  "session": {
    "access_token": "jwt-token",
    "expires_at": 1234567890
  }
}

// 失败 (401)
{
  "error": "邮箱或密码错误"
}
```

---

#### POST /api/subscribe

**描述:** 邮件订阅

**请求体:**
```typescript
interface SubscribeRequest {
  email: string;
  preferences?: {
    dailyDigest?: boolean;
    weeklyDigest?: boolean;
    alerts?: boolean;
  };
}
```

**响应:**
```typescript
// 成功 (201)
{
  "message": "订阅成功",
  "subscriber": {
    "email": "user@example.com",
    "subscribedAt": "2024-01-01T00:00:00Z"
  }
}

// 失败 (400)
{
  "error": "邮箱格式不正确"
}

// 失败 (409)
{
  "error": "该邮箱已订阅"
}
```

---

## 附录 B: 数据库 RLS 策略

### B.1 公开读取策略

```sql
-- 允许所有用户读取公司信息
CREATE POLICY "Companies are viewable by everyone" 
ON companies FOR SELECT 
TO anon, authenticated 
USING (true);

-- 允许所有用户读取财报数据
CREATE POLICY "Earnings are viewable by everyone" 
ON earnings FOR SELECT 
TO anon, authenticated 
USING (true);

-- 允许所有用户读取 AI 分析
CREATE POLICY "AI analyses are viewable by everyone" 
ON ai_analyses FOR SELECT 
TO anon, authenticated 
USING (true);
```

### B.2 用户私有数据策略

```sql
-- 用户只能看到自己的预警规则
CREATE POLICY "Users can only view own alert rules" 
ON alert_rules FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 用户只能创建自己的预警规则
CREATE POLICY "Users can only create own alert rules" 
ON alert_rules FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的预警规则
CREATE POLICY "Users can only update own alert rules" 
ON alert_rules FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 用户只能删除自己的预警规则
CREATE POLICY "Users can only delete own alert rules" 
ON alert_rules FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
```

### B.3 管理员策略

```sql
-- 管理员可以管理所有数据
CREATE POLICY "Admins can manage all data" 
ON ALL TABLES 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 附录 C: 性能优化索引

### C.1 现有索引

```sql
-- 公司表索引
CREATE INDEX idx_companies_symbol ON companies(symbol);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_symbol_ilike ON companies USING gin(symbol gin_trgm_ops);

-- 财报表索引
CREATE INDEX idx_earnings_company_id ON earnings(company_id);
CREATE INDEX idx_earnings_report_date ON earnings(report_date DESC);
CREATE INDEX idx_earnings_is_analyzed ON earnings(is_analyzed) WHERE is_analyzed = false;
CREATE INDEX idx_earnings_company_date ON earnings(company_id, report_date DESC);

-- AI 分析表索引
CREATE INDEX idx_ai_analyses_earnings_id ON ai_analyses(earnings_id);

-- 用户表索引
CREATE INDEX idx_users_email ON users(email);

-- 估值表索引
CREATE INDEX idx_company_valuation_symbol ON company_valuation(symbol);
CREATE INDEX idx_company_valuation_date ON company_valuation(symbol, date DESC);
```

### C.2 查询优化建议

**慢查询优化:**
```sql
-- 财报列表查询 (优化后)
SELECT e.*, c.name, c.sector
FROM earnings e
JOIN companies c ON e.company_id = c.id
WHERE c.symbol = 'AAPL'
ORDER BY e.report_date DESC
LIMIT 10;

-- 使用复合索引: idx_earnings_company_date
```

---

**文档结束**
