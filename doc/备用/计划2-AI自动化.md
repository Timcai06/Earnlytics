# 计划2：AI自动化

> 目标：集成DeepSeek API，实现数据自动获取和AI分析  
> 时间：Week 3-4（10个工作日）  
> 前置：计划1 MVP已上线  
> 成本：¥5-10（DeepSeek API费用）

---

## 阶段目标

✅ DeepSeek API集成，自动生成AI分析  
✅ 自动数据获取（定时任务）  
✅ 自动部署（新数据自动上线）  
✅ 扩展到10家公司  

---

## Week 3：AI分析引擎

### Day 1-2：DeepSeek配置

**1. 注册DeepSeek** (platform.deepseek.com)
- 创建账号
- 充值¥50-100（足够用几个月）
- 获取API Key

**2. 添加到环境变量** (Vercel Dashboard)
```
DEEPSEEK_API_KEY=sk-your-api-key
```

**3. 创建AI分析模块** (`lib/ai.ts`)：

```typescript
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function analyzeEarnings(data: {
  symbol: string
  companyName: string
  revenue: number
  revenueGrowth: number
  eps: number
  epsEstimate: number
  netIncome: number
}) {
  const prompt = `分析${data.companyName} (${data.symbol}) 财报：

营收: $${(data.revenue / 1e9).toFixed(2)}B (同比${data.revenueGrowth}%)
EPS: $${data.eps} (预期$${data.epsEstimate})
净利润: $${(data.netIncome / 1e9).toFixed(2)}B

请用中文返回JSON格式：
{
  "summary": "100字核心摘要",
  "highlights": ["亮点1", "亮点2"],
  "concerns": ["风险1", "风险2"],
  "sentiment": "positive/neutral/negative"
}`

  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是专业财报分析师，用简洁中文解读。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) throw new Error('DeepSeek API failed')
  
  const result = await response.json()
  return JSON.parse(result.choices[0].message.content)
}
```

### Day 3-4：数据库升级

**添加AI分析表**：

```sql
-- 创建AI分析表
CREATE TABLE ai_analyses (
  id SERIAL PRIMARY KEY,
  earnings_id INTEGER REFERENCES earnings(id) UNIQUE,
  summary TEXT NOT NULL,
  highlights JSONB,
  concerns JSONB,
  sentiment VARCHAR(20),
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 添加标记字段到earnings表
ALTER TABLE earnings ADD COLUMN is_analyzed BOOLEAN DEFAULT FALSE;
```

### Day 5：测试AI分析

**创建测试脚本** (`scripts/test-ai.ts`)：

```typescript
import { analyzeEarnings } from '@/lib/ai'

async function test() {
  const result = await analyzeEarnings({
    symbol: 'AAPL',
    companyName: 'Apple',
    revenue: 119575000000,
    revenueGrowth: 2.07,
    eps: 2.50,
    epsEstimate: 2.35,
    netIncome: 36300000000
  })
  
  console.log('AI分析结果：', result)
}

test()
```

**运行测试**：
```bash
npx tsx scripts/test-ai.ts
```

---

## Week 4：自动化流水线

### Day 6-7：数据获取脚本

**创建脚本** (`scripts/fetch-earnings.ts`)：

```typescript
import { supabase } from '@/lib/supabase'

const FMP_API_KEY = process.env.FMP_API_KEY

async function fetchEarnings() {
  // 1. 获取财报日历（未来7天）
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/earning_calendar?from=${today}&to=${nextWeek}&apikey=${FMP_API_KEY}`
  )
  
  const calendar = await response.json()
  
  // 2. 检查新财报
  for (const item of calendar) {
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('earnings')
      .select('id')
      .eq('symbol', item.symbol)
      .eq('fiscal_year', new Date(item.date).getFullYear())
      .single()
    
    if (existing) continue // 已存在，跳过
    
    // 3. 获取详细数据（简化版）
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('symbol', item.symbol)
      .single()
    
    if (!company) continue
    
    // 4. 插入数据
    await supabase.from('earnings').insert({
      company_id: company.id,
      fiscal_year: new Date(item.date).getFullYear(),
      fiscal_quarter: Math.ceil((new Date(item.date).getMonth() + 1) / 3),
      report_date: item.date,
      eps: item.eps,
      eps_estimate: item.epsEstimated,
      is_analyzed: false
    })
    
    console.log(`✅ 已添加 ${item.symbol} 财报`)
  }
}

fetchEarnings()
```

### Day 8-9：GitHub Actions配置

**创建工作流** (`.github/workflows/update.yml`)：

```yaml
name: Update Earnings

on:
  schedule:
    - cron: '0 */4 * * *'  # 每4小时运行
  workflow_dispatch:  # 支持手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - run: npm ci
      
      # 1. 获取新财报
      - name: Fetch earnings
        run: npx tsx scripts/fetch-earnings.ts
        env:
          FMP_API_KEY: ${{ secrets.FMP_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
      
      # 2. AI分析
      - name: Analyze with AI
        run: npx tsx scripts/analyze-batch.ts
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
      
      # 3. 触发Vercel重新部署
      - name: Trigger redeploy
        run: curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

**添加GitHub Secrets**：
- 进入 GitHub → Settings → Secrets and variables → Actions
- 添加：
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `FMP_API_KEY`
  - `DEEPSEEK_API_KEY`
  - `VERCEL_DEPLOY_HOOK`（在Vercel项目设置中获取）

### Day 10：批量分析脚本

**创建脚本** (`scripts/analyze-batch.ts`)：

```typescript
import { supabase } from '@/lib/supabase'
import { analyzeEarnings } from '@/lib/ai'

async function analyzeBatch() {
  // 1. 获取未分析的财报
  const { data: unanalyzed } = await supabase
    .from('earnings')
    .select('*, companies(symbol, name)')
    .eq('is_analyzed', false)
    .limit(5) // 每次最多分析5个
  
  if (!unanalyzed || unanalyzed.length === 0) {
    console.log('✅ 没有待分析的财报')
    return
  }
  
  // 2. 逐个分析
  for (const item of unanalyzed) {
    try {
      const result = await analyzeEarnings({
        symbol: item.companies.symbol,
        companyName: item.companies.name,
        revenue: item.revenue,
        revenueGrowth: item.revenue_yoy_growth,
        eps: item.eps,
        epsEstimate: item.eps_estimate,
        netIncome: item.net_income
      })
      
      // 3. 保存分析结果
      await supabase.from('ai_analyses').insert({
        earnings_id: item.id,
        summary: result.summary,
        highlights: result.highlights,
        concerns: result.concerns,
        sentiment: result.sentiment,
        cost_usd: 0.004 // 估算成本
      })
      
      // 4. 标记为已分析
      await supabase
        .from('earnings')
        .update({ is_analyzed: true })
        .eq('id', item.id)
      
      console.log(`✅ 已分析 ${item.companies.symbol}`)
    } catch (error) {
      console.error(`❌ 分析失败 ${item.companies.symbol}:`, error)
    }
  }
}

analyzeBatch()
```

---

## ISR配置

**更新页面** (`app/page.tsx`)：

```typescript
export const revalidate = 300 // 5分钟重新验证

export default async function Home() {
  // 获取数据...
}
```

---

## 扩展到10家公司

**添加更多公司**：

```sql
INSERT INTO companies (symbol, name, sector) VALUES
('NVDA', 'NVIDIA Corporation', 'Technology'),
('TSLA', 'Tesla Inc.', 'Consumer Cyclical'),
('NFLX', 'Netflix Inc.', 'Communication Services'),
('CRM', 'Salesforce Inc.', 'Technology'),
('AMD', 'Advanced Micro Devices', 'Technology');
```

---

## 成功标准

- [ ] DeepSeek API正常运行
- [ ] 新财报自动获取并分析
- [ ] 页面自动更新
- [ ] 10家公司数据正常展示
- [ ] GitHub Actions运行正常

---

## 成本估算

| 项目 | 数量/月 | 单价 | 月成本 |
|------|--------|------|--------|
| DeepSeek API | 50次分析 | ¥0.004/次 | ¥0.2 |
| 其他 | - | 免费 | ¥0 |
| **总计** | | | **¥0.2** |

---

## 下一步

进入 **计划3：规模化** - 扩展到30家公司，申请AdSense
