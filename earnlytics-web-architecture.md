# Earnlytics Web 项目架构详解

> 完整的项目结构分析、代码解读和技术栈说明

## 📋 目录

1. [项目概览](#项目概览)
2. [技术栈](#技术栈)
3. [目录结构](#目录结构)
4. [核心模块详解](#核心模块详解)
5. [数据流程](#数据流程)
6. [API接口](#api接口)
7. [关键代码解析](#关键代码解析)

---

## 项目概览

**Earnlytics** 是一个基于 AI 的美国科技公司财报分析平台，主要功能包括：

- 📊 自动获取30+科技公司的财报数据
- 🤖 使用 DeepSeek AI 生成中文财报分析
- 📅 财报日历展示
- 💼 投资组合管理
- 📧 邮件订阅系统
- 📈 数据可视化图表

**生产环境**: https://earnlytics-ebon.vercel.app

---

## 技术栈

### 前端框架
- **Next.js 16** - React 全栈框架，使用 App Router
- **React 19** - UI 库
- **TypeScript 5** - 类型安全

### 样式与UI
- **Tailwind CSS 4** - 原子化 CSS 框架
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 后端与数据
- **Supabase** - PostgreSQL 数据库 + 认证
- **Vercel Serverless** - API 路由托管
- **DeepSeek API** - AI 分析服务
- **Financial Modeling Prep (FMP)** - 财报数据源

### 开发工具
- **ESLint** - 代码检查
- **Jest + Testing Library** - 单元测试
- **Playwright** - E2E 测试
- **tsx** - TypeScript 脚本执行器

---

## 目录结构

```
earnlytics-web/
├── src/                          # 源代码目录
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # 认证相关页面组
│   │   ├── (marketing)/         # 营销页面组
│   │   ├── api/                 # API 路由
│   │   ├── earnings/[symbol]/   # 动态路由 - 财报详情页
│   │   ├── companies/           # 公司列表页
│   │   ├── calendar/            # 财报日历页
│   │   ├── portfolio/           # 投资组合页
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   └── globals.css          # 全局样式
│   │
│   ├── components/              # React 组件
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   ├── icons/               # SVG 图标组件
│   │   ├── layout/              # 布局组件 (Header, Footer)
│   │   ├── home/                # 首页组件
│   │   ├── companies/           # 公司相关组件
│   │   └── portfolio/           # 投资组合组件
│   │
│   ├── lib/                     # 工具库
│   │   ├── supabase.ts          # Supabase 客户端
│   │   ├── ai.ts                # AI 分析逻辑
│   │   ├── utils.ts             # 通用工具函数
│   │   ├── ai/                  # AI 相关模块
│   │   ├── alerts/              # 提醒系统
│   │   └── analysis/            # 分析工具
│   │
│   ├── types/                   # TypeScript 类型定义
│   │   ├── database.ts          # 数据库类型
│   │   └── investment.ts        # 投资相关类型
│   │
│   ├── hooks/                   # React Hooks
│   │   ├── use-aria.tsx         # 无障碍支持
│   │   └── use-performance.tsx  # 性能监控
│   │
│   └── styles/                  # 样式文件
│       ├── tokens.css           # 设计令牌
│       └── tokens.ts            # TypeScript 令牌
│
├── scripts/                     # 数据处理脚本
│   ├── fetch-earnings.ts        # 获取财报数据
│   ├── analyze-batch.ts         # 批量 AI 分析
│   ├── sync-sec-edgar.ts        # 同步 SEC 文档
│   └── process-alerts.ts        # 处理提醒
│
├── public/                      # 静态资源
│   ├── images/                  # 图片
│   └── ads.txt                  # AdSense 配置
│
├── docs/                        # 文档
│   ├── COMPONENTS.md            # 组件文档
│   ├── DEVELOPER_GUIDE.md       # 开发指南
│   └── BROWSER_COMPATIBILITY.md # 浏览器兼容性
│
├── e2e/                         # E2E 测试
├── next.config.ts               # Next.js 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目依赖
```

---

## 核心模块详解

### 1. App Router (`src/app/`)

Next.js 16 使用 App Router，基于文件系统的路由：

#### 主要页面

| 路径 | 文件 | 功能 |
|------|------|------|
| `/` | `page.tsx` | 首页 - Landing Page |
| `/earnings/[symbol]` | `earnings/[symbol]/page.tsx` | 动态财报详情页 |
| `/companies` | `companies/page.tsx` | 公司列表 |
| `/calendar` | `calendar/page.tsx` | 财报日历 |
| `/portfolio` | `portfolio/page.tsx` | 投资组合 |
| `/about` | `about/page.tsx` | 关于页面 |

#### 路由组 (Route Groups)

- `(auth)/` - 认证相关页面（登录、注册）
- `(marketing)/` - 营销页面（不需要认证）

#### 特殊文件

- `layout.tsx` - 根布局，包含 HTML 结构、元数据、全局样式
- `error.tsx` - 错误边界
- `loading.tsx` - 加载状态
- `not-found.tsx` - 404 页面

### 2. API 路由 (`src/app/api/`)

Next.js API Routes 提供后端接口：

```
api/
├── companies/route.ts          # GET /api/companies - 获取公司列表
├── earnings/route.ts           # GET /api/earnings - 获取财报数据
├── calendar/route.ts           # GET /api/calendar - 财报日历
├── subscribe/route.ts          # POST /api/subscribe - 邮件订阅
├── portfolio/route.ts          # CRUD /api/portfolio - 投资组合
├── analysis/route.ts           # GET /api/analysis - AI 分析
└── stock-price/route.ts        # GET /api/stock-price - 股价数据
```

### 3. 组件库 (`src/components/`)

#### UI 基础组件 (`ui/`)

基于 shadcn/ui 的可复用组件：

- `button.tsx` - 按钮组件
- `card.tsx` - 卡片容器
- `badge.tsx` - 标签徽章
- `input.tsx` - 输入框
- `tabs.tsx` - 标签页
- `tooltip.tsx` - 提示框
- `skeleton.tsx` - 骨架屏

#### 业务组件

- `layout/Header.tsx` - 顶部导航栏
- `layout/Footer.tsx` - 页脚
- `home/LandingPageUI.tsx` - 首页 UI
- `companies/CompanyCard.tsx` - 公司卡片
- `portfolio/PortfolioTable.tsx` - 投资组合表格

#### 图标组件 (`icons/`)

自定义 SVG 图标，替代 emoji：

```typescript
// src/components/icons/index.tsx
export const ChartIcon = () => (
  <svg>...</svg>
)
export const RocketIcon = () => (
  <svg>...</svg>
)
```

### 4. 数据层 (`src/lib/`)

#### Supabase 客户端 (`supabase.ts`)

```typescript
// 创建 Supabase 客户端
export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

// 数据库类型定义
export type Company = {
  id: number
  symbol: string
  name: string
  sector: string | null
  logo_url: string | null
}

export type Earning = {
  id: number
  company_id: number
  fiscal_year: number
  fiscal_quarter: number
  revenue: number | null
  eps: number | null
  // ...
}
```

#### AI 分析 (`ai.ts`)

```typescript
// 调用 DeepSeek API 生成财报分析
export async function analyzeEarnings(
  earning: EarningWithCompany
): Promise<{
  result: AIAnalysisResult
  tokensUsed: number
  costUsd: number
}> {
  // 1. 构建 prompt
  const userPrompt = `请分析以下公司的财报数据：
    公司: ${company.name}
    营收: ${earning.revenue}
    ...
  `
  
  // 2. 调用 DeepSeek API
  const response = await fetch(deepseekApiUrl, {
    method: 'POST',
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    })
  })
  
  // 3. 解析并验证结果
  const validated = AnalysisResultSchema.parse(parsed)
  
  return { result: validated, tokensUsed, costUsd }
}
```

#### 工具函数 (`utils.ts`)

```typescript
// Tailwind 类名合并
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 货币格式化
export function formatCurrency(value: number | null): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  return value.toLocaleString()
}
```

### 5. 数据脚本 (`scripts/`)

#### 获取财报数据 (`fetch-earnings.ts`)

```typescript
// 从 FMP API 获取财报数据并存入 Supabase
async function fetchAndStoreEarnings() {
  for (const symbol of SYMBOLS) {
    // 1. 获取公司 ID
    const companyId = await getCompanyId(symbol)
    
    // 2. 调用 FMP API
    const incomeStatements = await fetchIncomeStatements(symbol)
    
    // 3. 存入数据库
    for (const statement of incomeStatements) {
      await upsertEarnings(companyId, {
        fiscalYear: year,
        fiscalQuarter: quarter,
        revenue: statement.revenue,
        eps: statement.eps
      })
    }
  }
}
```

#### 批量 AI 分析 (`analyze-batch.ts`)

```typescript
// 批量处理未分析的财报（每次5条）
async function analyzeBatch() {
  // 1. 获取未分析的财报
  const unanalyzed = await getUnanalyzedEarnings(5)
  
  for (const earning of unanalyzed) {
    // 2. 调用 AI 分析
    const { result, tokensUsed, costUsd } = 
      await analyzeEarnings(earning)
    
    // 3. 保存分析结果
    await saveAnalysis(earning.id, result, tokensUsed, costUsd)
    
    // 4. 更新状态
    await supabase
      .from('earnings')
      .update({ is_analyzed: true })
      .eq('id', earning.id)
  }
}
```

---

## 数据流程

### 1. 财报数据获取流程

```
FMP API → fetch-earnings.ts → Supabase (earnings 表)
```

1. 脚本从 FMP API 获取最新财报数据
2. 解析并格式化数据
3. 使用 `upsert` 存入 Supabase（避免重复）

### 2. AI 分析流程

```
Supabase → analyze-batch.ts → DeepSeek API → Supabase (ai_analyses 表)
```

1. 查询未分析的财报 (`is_analyzed = false`)
2. 构建 prompt 并调用 DeepSeek API
3. 验证并保存分析结果
4. 更新财报状态为已分析

### 3. 用户访问流程

```
用户 → Next.js 页面 → API 路由 → Supabase → 返回数据 → 渲染页面
```

1. 用户访问 `/earnings/AAPL`
2. 页面组件调用 API `/api/earnings?symbol=AAPL`
3. API 路由查询 Supabase
4. 返回财报数据 + AI 分析
5. 页面渲染数据和图表

---

## API接口

### GET /api/companies

获取所有公司列表

**响应示例**:
```json
{
  "companies": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "logo_url": "https://logo.clearbit.com/apple.com"
    }
  ]
}
```

### GET /api/earnings?symbol=AAPL

获取指定公司的财报数据

**查询参数**:
- `symbol` - 公司股票代码

**响应示例**:
```json
{
  "earnings": [
    {
      "id": 1,
      "fiscal_year": 2024,
      "fiscal_quarter": 1,
      "revenue": 119575000000,
      "eps": 2.18,
      "ai_analyses": {
        "summary": "苹果公司Q1财报表现强劲...",
        "highlights": ["营收创历史新高", "iPhone销售超预期"],
        "concerns": ["中国市场增长放缓"],
        "sentiment": "positive"
      }
    }
  ]
}
```

### POST /api/subscribe

邮件订阅

**请求体**:
```json
{
  "email": "user@example.com"
}
```

---

## 关键代码解析

### 1. 动态路由参数解包

Next.js 15+ 中 `params` 是 Promise，需要使用 `React.use()` 解包：

```typescript
// src/app/earnings/[symbol]/page.tsx
export default async function EarningsPage({
  params,
}: {
  params: Promise<{ symbol: string }>
}) {
  // 解包 Promise
  const { symbol } = await params
  
  // 获取数据
  const data = await fetchEarnings(symbol)
  
  return <EarningsDetail data={data} />
}
```

### 2. Supabase 查询

```typescript
// 联表查询：earnings + companies + ai_analyses
const { data, error } = await supabase
  .from('earnings')
  .select(`
    *,
    companies (*),
    ai_analyses (*)
  `)
  .eq('company_id', companyId)
  .order('report_date', { ascending: false })
```

### 3. AI 分析 Prompt

```typescript
const SYSTEM_PROMPT = `你是一个专业的财务分析师...

请用JSON格式返回以下字段：
{
  "summary": "整体业绩的中文摘要（200-300字）",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "concerns": ["关注点1", "关注点2"],
  "sentiment": "positive" | "neutral" | "negative"
}
`
```

### 4. 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DEEPSEEK_API_KEY=xxx
FMP_API_KEY=xxx
```

### 5. 图表组件

使用 Recharts 渲染财报趋势图：

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts'

<LineChart data={earningsData}>
  <XAxis dataKey="quarter" />
  <YAxis />
  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
</LineChart>
```

---

## 数据库 Schema

### companies 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| symbol | varchar | 股票代码 (AAPL) |
| name | varchar | 公司名称 |
| sector | varchar | 行业 |
| logo_url | varchar | Logo URL |

### earnings 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| company_id | int | 外键 → companies |
| fiscal_year | int | 财年 |
| fiscal_quarter | int | 季度 (1-4) |
| revenue | bigint | 营收 |
| eps | decimal | 每股收益 |
| is_analyzed | boolean | 是否已分析 |

### ai_analyses 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| earnings_id | int | 外键 → earnings |
| summary | text | 分析摘要 |
| highlights | jsonb | 亮点数组 |
| concerns | jsonb | 关注点数组 |
| sentiment | varchar | 情绪 (positive/neutral/negative) |
| tokens_used | int | 使用的 token 数 |
| cost_usd | decimal | 成本 (美元) |

---

## 部署与运维

### Vercel 部署

```bash
# 自动部署（推送到 main 分支）
git push origin main

# 手动部署
vercel --prod
```

### GitHub Actions 自动化

每4小时自动执行：

```yaml
# .github/workflows/fetch-earnings.yml
on:
  schedule:
    - cron: '0 */4 * * *'  # 每4小时

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - run: npm run fetch:earnings
      - run: npm run analyze:batch
```

### 成本控制

- **Vercel**: 免费额度（100GB 带宽/月）
- **Supabase**: 免费额度（500MB 数据库）
- **DeepSeek API**: ~¥0.2-1/月（极低成本）
- **FMP API**: 免费额度（250 请求/天）

---

## 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 数据操作
npm run fetch:earnings   # 获取最新财报
npm run analyze:batch    # 批量 AI 分析（5条）

# 测试
npm run test            # 运行单元测试
npm run test:coverage   # 测试覆盖率

# 构建
npm run build           # 生产构建
npm run lint            # 代码检查
```

---

## 最佳实践

### 1. 类型安全

所有数据库查询都有完整的 TypeScript 类型：

```typescript
import type { EarningWithAnalysis } from '@/types/database'

const earnings: EarningWithAnalysis[] = await fetchEarnings()
```

### 2. 错误处理

```typescript
try {
  const data = await fetchData()
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Failed to fetch data' },
    { status: 500 }
  )
}
```

### 3. 性能优化

- 使用 Next.js Image 组件优化图片
- 代码分割（动态导入）
- 缓存策略（ISR）

```typescript
// 增量静态再生成（每小时更新）
export const revalidate = 3600
```

### 4. SEO 优化

```typescript
export const metadata: Metadata = {
  title: 'Earnlytics - AI财报分析',
  description: '专业的AI财报分析平台',
  keywords: ['财报分析', 'AI投资'],
  openGraph: { ... },
  robots: { index: true, follow: true }
}
```

---

## 常见问题

### Q: 如何添加新公司？

在 `scripts/fetch-earnings.ts` 的 `SYMBOLS` 数组中添加股票代码：

```typescript
const SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL',
  'NEWCO'  // 新增公司
]
```

### Q: 如何修改 AI 分析 prompt？

编辑 `src/lib/ai.ts` 中的 `SYSTEM_PROMPT` 常量。

### Q: 如何更改分析批次大小？

修改 `scripts/analyze-batch.ts` 中的 `getUnanalyzedEarnings(5)` 参数。

---

## 总结

Earnlytics 是一个现代化的全栈 Web 应用，采用：

- **前端**: Next.js 16 + React 19 + TypeScript
- **后端**: Vercel Serverless + Supabase
- **AI**: DeepSeek API
- **数据源**: Financial Modeling Prep

核心特点：
- ✅ 完全类型安全
- ✅ 自动化数据流程
- ✅ 极低运营成本（~¥1/月）
- ✅ 高性能（Vercel Edge Network）
- ✅ SEO 友好

---

**最后更新**: 2026-02-25
**文档版本**: 1.0
