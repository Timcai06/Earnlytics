# 计划1：MVP启动

> 目标：2周内上线可访问的MVP，验证产品可行性  
> 时间：Week 1-2（10个工作日）  
> 成本：¥0

---

## 阶段目标

✅ 搭建完整技术栈  
✅ 手动填充5家公司数据  
✅ 部署到Vercel可访问  
✅ 获取首批用户反馈  

---

## Week 1：基础设施

### Day 1-2：账号注册

**必须注册的服务**：

1. **GitHub** (github.com)
   - 创建仓库：earnlytics
   - 设置为Public（GitHub Actions免费）

2. **Vercel** (vercel.com)
   - 用GitHub账号登录
   - 后续部署用

3. **Supabase** (supabase.com)
   - 创建新项目
   - 记录：Project URL 和 Anon Key

4. **FMP API** (financialmodelingprep.com)
   - 注册免费账号
   - 获取API Key（每天250次调用）

**注册后记录这些信息**：
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
FMP_API_KEY=your_api_key_here
```

### Day 3-4：数据库搭建

**SQL命令**（在Supabase SQL Editor执行）：

```sql
-- 创建公司表
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sector VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建财报表
CREATE TABLE earnings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER NOT NULL,
  report_date DATE NOT NULL,
  revenue NUMERIC(20, 2),
  revenue_yoy_growth DECIMAL(5, 2),
  eps DECIMAL(10, 2),
  eps_estimate DECIMAL(10, 2),
  net_income NUMERIC(20, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year, fiscal_quarter)
);

-- 插入5家公司
INSERT INTO companies (symbol, name, sector) VALUES
('AAPL', 'Apple Inc.', 'Technology'),
('MSFT', 'Microsoft Corporation', 'Technology'),
('GOOGL', 'Alphabet Inc.', 'Technology'),
('AMZN', 'Amazon.com Inc.', 'Consumer Cyclical'),
('META', 'Meta Platforms Inc.', 'Communication Services');
```

### Day 5：初始化项目

**本地开发环境**：

```bash
# 创建Next.js项目
npx create-next-app@14 earnlytics --typescript --tailwind --eslint --app --src-dir

# 进入项目
cd earnlytics

# 安装依赖
npm install @supabase/supabase-js
npx shadcn-ui@latest init

# 安装常用组件
npx shadcn-ui@latest add button card table
```

**环境变量**（创建 `.env.local`）：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Week 2：开发与部署

### Day 6-7：基础页面

**创建文件**：

```typescript
// app/page.tsx - 首页
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: earnings } = await supabase
    .from('earnings')
    .select('*, companies(symbol, name)')
    .order('report_date', { ascending: false })

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Earnlytics - AI财报分析</h1>
      <div className="grid gap-4">
        {earnings?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.companies.name} ({item.companies.symbol})</CardTitle>
            </CardHeader>
            <CardContent>
              <p>FY{item.fiscal_year} Q{item.fiscal_quarter}</p>
              <p>营收: ${(item.revenue / 1e9).toFixed(2)}B</p>
              <p>EPS: ${item.eps}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
```

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Day 8-9：手动填充数据

**获取5家公司最新财报**（手动）：

1. 去Yahoo Finance搜索 AAPL
2. 找到最近季度财报数据
3. 手动填入数据库：

```sql
-- 示例：插入Apple Q1 2026财报
INSERT INTO earnings (company_id, fiscal_year, fiscal_quarter, report_date, revenue, revenue_yoy_growth, eps, eps_estimate, net_income)
VALUES (1, 2026, 1, '2026-01-30', 119575000000, 2.07, 2.50, 2.35, 36300000000);

-- 为其他4家公司插入类似数据
```

**手动编写AI分析**（暂时不用API）：

```sql
-- 添加AI分析字段
ALTER TABLE earnings ADD COLUMN ai_summary TEXT;

-- 手动填写（示例）
UPDATE earnings SET ai_summary = '苹果Q1财报超预期，营收$119.6B同比增长2%，EPS $2.50显著高于预期的$2.35。iPhone销量稳定，服务业务创新高，但大中华区表现疲软。整体业绩稳健，现金流强劲。' 
WHERE id = 1;
```

### Day 10：部署上线

**部署到Vercel**：

```bash
# 提交代码
git add .
git commit -m "Initial MVP"
git push origin main

# 在Vercel导入项目
# 1. 登录 vercel.com
# 2. Add New Project
# 3. 选择 GitHub 仓库
# 4. Deploy
```

**验证**：
- [ ] 访问 `https://earnlytics.vercel.app` 正常
- [ ] 首页显示5家公司财报
- [ ] 数据展示正确
- [ ] 手机访问正常

---

## MVP成功标准

### 必须完成
- [ ] 网站可公开访问
- [ ] 展示5家公司最新财报
- [ ] 显示核心数据（营收、EPS、同比）
- [ ] 有AI分析摘要（手动编写）
- [ ] 手机端显示正常

### 不需要（后续计划）
- ❌ 自动数据获取
- ❌ DeepSeek API集成
- ❌ 自动化部署
- ❌ Google AdSense
- ❌ 财报日历

---

## 资源清单

| 资源 | 用途 | 成本 | 注册地址 |
|------|------|------|---------|
| GitHub | 代码托管 | ¥0 | github.com |
| Vercel | 网站部署 | ¥0 | vercel.com |
| Supabase | 数据库 | ¥0 | supabase.com |
| FMP API | 财报数据 | ¥0 | financialmodelingprep.com |

---

## Week 2 结束检查清单

- [ ] 网站可访问
- [ ] 5家公司数据展示
- [ ] 向3位朋友展示并收集反馈
- [ ] 至少有1位表示"会再次访问"
- [ ] 记录需要改进的地方

---

## 下一步

完成MVP后，进入 **计划2：AI自动化**

**计划2目标**：
- 集成DeepSeek API
- 实现自动数据获取
- 实现自动部署

**准备好开始了吗？** 注册那些账号！
