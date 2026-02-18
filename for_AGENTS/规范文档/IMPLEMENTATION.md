# 实施指南

**更新日期:** 2026-02-18  
**版本:** 1.1

---

## 开发环境搭建

### 前置要求

- Node.js 20.x 或更高版本
- npm 10.x 或更高版本
- Git

### 项目克隆

```bash
git clone https://github.com/Timcai06/Earnlytics.git
cd Earnlytics
cd earnlytics-web
```

### 依赖安装

```bash
npm install
```

### 环境变量配置

创建 `.env.local` 文件:

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 服务配置
DEEPSEEK_API_KEY=your-deepseek-key

# 数据源配置
FMP_API_KEY=your-fmp-key
```

### 启动开发服务器

```bash
npm run dev
```

---

## 代码规范

### Git 工作流

```
main 分支 (生产环境)
  │
  ├─▶ feature/xxx  (功能分支)
  │      │
  │      ▼
  │   提交 PR
  │      │
  │      ▼
  └─▶ 合并到 main
```

### 文件命名规范

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件 | PascalCase | `Button.tsx` |
| Hook | camelCase | `useAuth.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型定义 | PascalCase | `types/earnings.ts` |

---

## 组件开发指南

### 创建新组件

```bash
# shadcn/ui 组件
npx shadcn add button

# 自定义组件
touch src/components/custom/MyComponent.tsx
```

### 组件模板

```tsx
"use client";

import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn("p-4 rounded-lg border", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}
```

---

## API 开发指南

### 创建新 API 路由

```typescript
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 数据库操作指南

### 查询数据

```typescript
// 基础查询
const { data, error } = await supabase
  .from('companies')
  .select('*');

// 条件查询
const { data } = await supabase
  .from('earnings')
  .select('*')
  .eq('company_id', companyId)
  .order('report_date', { ascending: false })
  .limit(10);
```

### 插入数据

```typescript
const { data, error } = await supabase
  .from('subscribers')
  .insert({
    email: 'user@example.com',
    is_active: true,
  })
  .select()
  .single();
```

---

## 脚本开发指南

### 创建新脚本

```typescript
// scripts/my-script.ts
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log('开始执行脚本...');
  // 脚本逻辑
}

main();
```

### 添加 npm 脚本

```json
{
  "scripts": {
    "my-script": "tsx scripts/my-script.ts"
  }
}
```

---

## 部署指南

### Vercel 部署

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 环境变量配置

在 Vercel Dashboard 中设置:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DEEPSEEK_API_KEY`

---

## 安全规范

- ✅ 使用环境变量存储密钥
- ❌ 绝不提交密钥到 Git

---

## 测试规范

```bash
npm test           # 运行测试
npm run test:watch # 监听模式
```

## 故障排除

### 开发环境问题

#### npm install 失败
```bash
# 清除缓存后重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 端口被占用
```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 结束进程
kill -9 <PID>
# 或使用其他端口
npm run dev -- --port 3001
```

### 构建问题

#### 类型错误
```bash
# 运行类型检查
npx tsc --noEmit

# 常见修复
# 1. 确保所有 props 都有类型定义
# 2. 检查 import 路径是否正确
# 3. 确认依赖包已正确安装
```

#### 构建失败
```bash
# 清除缓存
rm -rf .next
npm run build

# 检查环境变量
# 确保 .env.local 存在且包含必要变量
```

### 运行时问题

#### 500 错误 - Turbopack 崩溃
```bash
# 清除 Turbopack 缓存
rm -rf .next node_modules/.cache
npm run dev
```

#### Supabase 连接失败
```bash
# 检查环境变量
cat .env.local | grep SUPABASE

# 验证连接
npm run check:data
```

#### AI 分析失败
```bash
# 检查 DeepSeek API Key
cat .env.local | grep DEEPSEEK

# 测试 API 连接
npm run test:ai
```

### 测试问题

#### Jest 测试失败
```bash
# 清除测试缓存
npm run test -- --clearCache

# 运行单个测试文件
npm run test -- src/__tests__/api/investment-api.test.tsx

# 查看详细错误
npm run test -- --verbose
```

### 常见问题速查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| `Request is not defined` | Jest 环境缺少 Web API | 检查 jest.setup.ts 中的 polyfill |
| `Cannot find module` | 路径别名配置错误 | 检查 tsconfig.json 和 jest.config.ts |
| `params is not iterable` | Next.js 15 params 是 Promise | 使用 `React.use()` 或 `await params` |
| `useSearchParams returns null` | Suspense 边界问题 | 使用动态路由替代 query params |
| `Module not found` | 依赖未安装 | 运行 `npm install` |
| `Type error` | 类型定义不完整 | 添加完整的 interface/type 定义 |

### 调试技巧

```bash
# 查看详细日志
DEBUG=* npm run dev

# 检查 Next.js 配置
cat next.config.ts

# 验证 TypeScript 配置
npx tsc --showConfig

# 检查 ESLint 配置
npx eslint --print-config src/app/page.tsx
```

### 性能优化

#### 减少包体积
```bash
# 分析包大小
npm run build
npm run analyze
```

#### 优化图片
```bash
# 使用 Next.js Image 组件
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false} // 设置为 true 如果是首屏图片
/>
```

### Git 问题

#### 误提交敏感信息
```bash
# 1. 重置提交 (如果未推送)
git reset --soft HEAD~1

# 2. 添加到 .gitignore
echo ".env.local" >> .gitignore

# 3. 轮换密钥 (重要!)
# 在 Vercel/Supabase 控制台重新生成 API Key
```

#### 合并冲突
```bash
# 放弃本地更改
git checkout -- .

# 或保留本地更改
git add .
git rebase --continue
```

---

**相关文档:**
- [后端架构](./BACKEND_STRUCTURE.md)
- [前端规范](./FRONTED_GUIDELINES.md)
- [应用流程](./APP_FLOW.md)

---

## 附录 A: 详细实施计划 (Implementation Plan)

### A.1 项目初始化步骤

**步骤 1.1: 环境检查**
```bash
# 检查 Node.js 版本 (必须 >= 20)
node --version

# 检查 npm 版本 (必须 >= 10)
npm --version

# 检查 Git
git --version
```

**步骤 1.2: 克隆项目**
```bash
git clone https://github.com/Timcai06/Earnlytics.git
cd Earnlytics
```

**步骤 1.3: 安装依赖**
```bash
cd earnlytics-web
npm install
```

**步骤 1.4: 环境变量配置**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 填入你的密钥
nano .env.local
```

**步骤 1.5: 启动开发服务器**
```bash
npm run dev
# 访问 http://localhost:3000
```

**步骤 1.6: 验证安装**
```bash
# 运行 lint
npm run lint

# 运行类型检查
npx tsc --noEmit

# 运行构建测试
npm run build
```

---

### A.2 添加新功能的详细步骤

#### 场景: 添加一个新的数据展示页面

**步骤 2.1: 阅读规范文档 (5分钟)**
1. 阅读 PRD.md 确认功能需求
2. 阅读 APP_FLOW.md 了解用户流程
3. 阅读 FRONTEND_GUIDELINES.md 确认设计规范
4. 阅读 BACKEND_STRUCTURE.md 确认数据需求

**步骤 2.2: 创建页面文件**
```bash
# 创建页面目录和文件
mkdir -p src/app/new-feature
touch src/app/new-feature/page.tsx
```

**步骤 2.3: 实现服务端组件**
```tsx
// src/app/new-feature/page.tsx
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "新功能 | Earnlytics",
  description: "功能描述",
};

async function getData() {
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .limit(10);
  
  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }
  
  return data;
}

export default async function NewFeaturePage() {
  const data = await getData();
  
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">新功能标题</h1>
      {/* 渲染数据 */}
    </main>
  );
}
```

**步骤 2.4: 创建客户端组件 (如果需要交互)**
```bash
mkdir -p src/components/new-feature
touch src/components/new-feature/DataList.tsx
```

```tsx
// src/components/new-feature/DataList.tsx
"use client";

import { useState } from "react";

interface DataItem {
  id: number;
  name: string;
}

interface DataListProps {
  initialData: DataItem[];
}

export function DataList({ initialData }: DataListProps) {
  const [data, setData] = useState(initialData);
  
  return (
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.id} className="p-4 border rounded-lg">
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

**步骤 2.5: 添加类型定义**
```bash
touch src/types/new-feature.ts
```

```typescript
// src/types/new-feature.ts
export interface DataItem {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface DataListResponse {
  items: DataItem[];
  total: number;
}
```

**步骤 2.6: 测试功能**
```bash
# 检查类型
npx tsc --noEmit

# 检查代码风格
npm run lint

# 构建测试
npm run build
```

**步骤 2.7: 更新文档**
1. 更新 progress.txt 记录完成的功能
2. 如果需要，更新相关规范文档

**步骤 2.8: 提交代码**
```bash
git add .
git commit -m "feat: 添加新功能 - 功能描述"
```

---

### A.3 添加 API 端点的步骤

**步骤 3.1: 创建 API 路由文件**
```bash
mkdir -p src/app/api/new-endpoint
touch src/app/api/new-endpoint/route.ts
```

**步骤 3.2: 实现 API 路由**
```typescript
// src/app/api/new-endpoint/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// 输入验证 schema
const requestSchema = z.object({
  param1: z.string().min(1),
  param2: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const param1 = searchParams.get("param1");
    
    // 验证输入
    const validation = requestSchema.safeParse({ param1 });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }
    
    // 查询数据库
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .eq("column", param1);
    
    if (error) throw error;
    
    return NextResponse.json({ data });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    // 插入数据
    const { data, error } = await supabase
      .from("table_name")
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ data }, { status: 201 });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**步骤 3.3: 测试 API**
```bash
# 启动开发服务器
npm run dev

# 使用 curl 测试
curl "http://localhost:3000/api/new-endpoint?param1=test"

# 或使用 Postman/Insomnia
```

---

## 附录 B: 故障排除快速参考

### B.1 常见错误速查表

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|----------|
| `Module not found` | 依赖未安装或路径错误 | `npm install` 或检查 import 路径 |
| `Cannot find module '@/lib/...'` | 路径别名配置错误 | 检查 tsconfig.json paths 配置 |
| `Property 'x' does not exist` | 类型定义缺失 | 添加类型定义或检查属性名 |
| `React Hook rules violation` | Hook 使用不规范 | 确保 Hook 在组件顶层调用 |
| `Text content does not match` | 服务端/客户端渲染不一致 | 检查 useEffect 中的客户端逻辑 |
| `Failed to compile` | 语法错误或类型错误 | 检查控制台错误信息 |
| `Request failed with status 500` | API 路由报错 | 检查 API 路由日志 |

### B.2 调试技巧

**前端调试:**
```typescript
// 使用 console.log 调试 (开发环境)
console.log("Data:", data);
console.table(arrayData);

// React DevTools
// 安装浏览器扩展，检查组件状态和 props

// 网络请求调试
// 打开 DevTools → Network → 查看请求/响应
```

**后端调试:**
```typescript
// API 路由中添加日志
export async function GET(request: Request) {
  console.log("API called with params:", request.url);
  
  try {
    const result = await fetchData();
    console.log("Query result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
```

### B.3 性能调试

```bash
# 分析构建输出
npm run build

# 使用 Lighthouse
# Chrome DevTools → Lighthouse → 生成报告

# 检查包大小
npm run build
# 查看 .next/static/chunks 目录大小
```

---

## 附录 C: Git 工作流

### C.1 分支策略

```bash
# 主分支 (生产环境)
main

# 功能分支
feature/description

# Bug 修复分支
fix/description

# 文档分支
docs/description
```

### C.2 提交信息规范

**格式:** `<type>: <description>`

**类型:**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式 (不影响功能)
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```bash
git commit -m "feat: 添加财报日历组件"
git commit -m "fix: 修复移动端导航栏显示问题"
git commit -m "docs: 更新 API 文档"
git commit -m "refactor: 优化数据获取逻辑"
```

### C.3 常用 Git 命令

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 暂存更改
git add .

# 提交更改
git commit -m "feat: 描述"

# 推送到远程
git push -u origin feature/new-feature

# 查看状态
git status

# 查看历史
git log --oneline -10

# 撤销上次提交 (保留更改)
git reset --soft HEAD~1

# 撤销上次提交 (丢弃更改)
git reset --hard HEAD~1
```

---

## 附录 D: 环境变量完整清单

### D.1 必需变量

```bash
# Supabase 配置 (必需)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 服务 (必需)
DEEPSEEK_API_KEY=sk-your-key

# 数据源 (必需)
FMP_API_KEY=your-fmp-api-key
```

### D.2 可选变量

```bash
# 分析 (可选)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 错误监控 (可选)
SENTRY_DSN=https://...@sentry.io/...

# 开发配置 (可选)
NEXT_PUBLIC_DEBUG=true
```

### D.3 环境变量检查清单

**开发环境:**
- [ ] 已创建 .env.local
- [ ] 已填入所有必需变量
- [ ] 已测试数据库连接
- [ ] 已测试 API 密钥

**生产环境 (Vercel):**
- [ ] 已在 Vercel Dashboard 设置变量
- [ ] 已验证所有变量生效
- [ ] 已删除不必要的 DEBUG 变量

---

**文档结束**
