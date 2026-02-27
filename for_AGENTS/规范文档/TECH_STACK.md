# 技术栈文档 (TECH STACK)

**文档版本:** 2.0  
**更新日期:** 2026-02-27  
**适用范围:** Earnlytics 全栈技术架构  
**状态:** LOCKED - 未经许可不得更改

---

## 版本锁定声明

**本文档定义的技术栈版本已锁定。**  
AI 助手在开发时必须使用以下确切版本，不得自行升级或更换。  
如需变更技术栈，必须更新本文档并获得明确授权。

---

## 1. 技术栈概述

```yaml
Architecture: Serverless (Vercel)
Frontend: Next.js 16 + React 19 + TypeScript 5
Styling: Tailwind CSS 4 + shadcn/ui
Backend: Supabase (PostgreSQL)
AI: DeepSeek-V3 API
Data: Financial Modeling Prep (FMP) API
```

**架构原则:**
- **Serverless First:** 无服务器架构，按需扩展，零运维
- **Type Safety:** 全栈 TypeScript，编译时捕获错误
- **Performance:** 边缘计算、CDN 加速、流式渲染
- **Cost Effective:** 低成本运行（月度 < ¥10）

---

## 2. 前端技术栈 (LOCKED VERSIONS)

### 2.1 核心框架

| 技术 | 锁定版本 | 用途 | 替代方案 |
|------|---------|------|----------|
| **Next.js** | 16.1.6 | React 框架，App Router | ❌ 不允许 |
| **React** | 19.2.3 | UI 库 | ❌ 不允许 |
| **TypeScript** | ^5 | 类型系统 | ❌ 不允许 |

**版本选择理由:**
- Next.js 16 提供 App Router 和 Server Components，性能最优
- React 19 带来更好的并发特性和自动记忆化
- TypeScript 5.x 提供稳定的类型推断能力

### 2.2 样式解决方案

| 技术 | 锁定版本 | 用途 |
|------|---------|------|
| **Tailwind CSS** | ^4 | 原子化 CSS 框架 |
| **PostCSS** | 8.5.0 | CSS 处理 |
| **Autoprefixer** | 10.4.20 | 浏览器前缀自动添加 |
| **class-variance-authority** | 0.7.1 | 组件变体管理 |
| **clsx** | 2.1.1 | 条件类名合并 |
| **tailwind-merge** | ^3.4.0 | Tailwind 类名去重合并 |

**Tailwind 配置 (tailwind.config.ts):**
```typescript
const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        background: "#0a0a0f",
        foreground: "#fafafa",
        card: {
          DEFAULT: "#12121a",
          foreground: "#fafafa",
        },
        border: "rgba(255, 255, 255, 0.1)",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
}
```

### 2.3 UI 组件和图标

| 技术 | 锁定版本 | 用途 |
|------|---------|------|
| **shadcn/ui** | latest (通过 CLI 安装) | 基础 UI 组件库 |
| **@radix-ui/react-* | latest | 无头 UI 原语 |
| **Lucide React** | ^0.563.0 | 图标库 |

**已安装的 shadcn/ui 组件:**
- button, card, input, label
- select, dialog, dropdown-menu
- table, tabs, accordion
- skeleton, separator, avatar
- toast, tooltip, badge

### 2.4 动画和可视化

| 技术 | 锁定版本 | 用途 |
|------|---------|------|
| **Framer Motion** | ^12.34.0 | React 动画库 |
| **Recharts** | ^2.15.1 | 图表库 |
| **next/web-vitals** | Next.js 内置 | 前端性能指标上报 |

**Framer Motion 使用场景:**
- 页面过渡动画
- 组件进入/退出动画
- 悬停和点击微交互
- 数字和进度动画

**Recharts 使用场景:**
- 估值历史图表
- 同行对比图表
- 财务指标趋势图

### 2.7 性能基建约定

- 首页数据优先使用 Server Component + 缓存。
- 客户端按需加载：`next/dynamic` + 可见区挂载。
- API 支持条件请求：`ETag` / `304 Not Modified`。
- Web Vitals 统一通过 `/api/web-vitals` 汇总观察。

### 2.5 表单和验证

| 技术 | 锁定版本 | 用途 |
|------|---------|------|
| **react-hook-form** | 7.54.0 | 表单状态管理 |
| **zod** | 3.24.0 | 运行时类型验证 |
| **@hookform/resolvers** | 3.10.0 | 表单验证集成 |

### 2.6 状态管理

**不使用 Redux、Zustand 或类似状态管理库。**

使用以下方案:
- **Server Components** - 服务端数据获取 (首选)
- **React Hooks** - 本地状态 (useState, useReducer)
- **Context API** - 全局状态 (用户认证、主题)
- **Supabase Realtime** - 实时数据订阅

---

## 3. 后端技术栈 (LOCKED VERSIONS)

### 3.1 运行环境

| 技术 | 锁定版本 | 用途 |
|------|---------|------|
| **Node.js** | 20.x LTS | JavaScript 运行时 |
| **Vercel Runtime** | Node.js 20.x | 无服务器部署 |

**Vercel 配置 (vercel.json):**
```json
{
  "regions": ["sin1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 3.2 数据库 (Supabase)

| 技术 | 版本/计划 | 用途 |
|------|----------|------|
| **PostgreSQL** | 15.x | 关系型数据库 |
| **Supabase JS Client** | ^2.95.3 | 数据库客户端 |
| **Supabase Plan** | Free Tier | 托管服务 |

**Supabase 配置:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**启用功能:**
- Row Level Security (RLS) - 行级安全
- Database Functions - 数据库函数
- Realtime - 实时订阅 (可选)

### 3.3 AI 服务

| 服务 | 模型/版本 | 成本 |
|------|----------|------|
| **DeepSeek API** | deepseek-chat (DeepSeek-V3) | ¥0.002/1K tokens |

**AI 配置:**
```typescript
// src/lib/ai.ts
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

const SYSTEM_PROMPT = `你是一个专业的财务分析师，擅长分析美国科技公司的财报...`
```

**平均分析成本:** ¥0.01-0.05/条财报

### 3.4 数据源

| 服务 | API 版本 | 用途 |
|------|---------|------|
| **FMP API** | v3 | 财报数据、股价、公司信息 |

**FMP 配置:**
```typescript
const FMP_API_KEY = process.env.FMP_API_KEY
const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3"
```

---

## 4. 开发工具 (LOCKED VERSIONS)

### 4.1 构建工具

| 工具 | 锁定版本 | 用途 |
|------|---------|------|
| **Next.js Compiler** | 内置 | 代码编译 (SWC) |
| **Turbopack** | 内置 | 开发服务器 (Next.js 16 默认) |

### 4.2 代码质量

| 工具 | 锁定版本 | 配置位置 |
|------|---------|----------|
| **ESLint** | 9.x | eslint.config.ts |
| **TypeScript** | ^5 | tsconfig.json |

**ESLint 规则:**
- 使用 Next.js 推荐配置
- 禁止使用 `any`
- 禁止使用 `@ts-ignore`

### 4.3 测试工具

| 工具 | 锁定版本 | 用途 |
|------|---------|------|
| **Jest** | ^30.2.0 | 单元测试框架 |
| **React Testing Library** | ^16.3.2 | React 组件测试 |
| **node-fetch** | 2.7.0 | Node.js fetch polyfill (测试用) |

**Jest 配置:**
```typescript
// jest.config.ts
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

### 4.4 脚本运行器

| 工具 | 锁定版本 | 用途 |
|------|---------|------|
| **tsx** | ^4.21.0 | TypeScript 脚本执行 |
| **dotenv** | ^17.2.4 | 环境变量加载 |

---

## 5. 部署与运维

### 5.1 部署平台

| 平台 | 用途 | 配置 |
|------|------|------|
| **Vercel** | 前端 + API 部署 | 自动部署 |
| **GitHub Actions** | CI/CD、定时任务 | `.github/workflows/` |

### 5.2 环境变量 (REQUIRED)

```bash
# 必需环境变量
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DEEPSEEK_API_KEY=
FMP_API_KEY=

# 可选环境变量
NEXT_PUBLIC_GA_ID=              # Google Analytics
SENTRY_DSN=                     # 错误监控
```

**环境变量规则:**
- `NEXT_PUBLIC_*` - 可在客户端使用
- 其他变量 - 仅在服务端使用
- 绝不在代码中硬编码密钥

### 5.3 监控工具

| 工具 | 用途 | 状态 |
|------|------|------|
| **Vercel Analytics** | 性能监控 | 已启用 |
| **Vercel Logs** | 日志查看 | 已启用 |
| **Supabase Dashboard** | 数据库监控 | 已启用 |

---

## 6. 包管理

### 6.1 依赖安装命令

```bash
# 生产依赖
npm install package-name

# 开发依赖
npm install -D package-name

# 安装特定版本
npm install package-name@1.2.3
```

### 6.2 关键依赖清单

**package.json 关键依赖:**
```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@supabase/supabase-js": "^2.95.3",
    "framer-motion": "^12.34.0",
    "recharts": "^2.15.1",
    "lucide-react": "^0.563.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "eslint": "^9",
    "jest": "^30.2.0",
    "tsx": "^4.21.0"
  }
}
```

---

## 7. 技术选型对比记录

### 7.1 前端框架选择

| 方案 | 评估 | 选择 |
|------|------|------|
| Next.js 16 | ✅ App Router、Server Components、性能优秀 | **已采用** |
| Remix | ❌ 生态系统较小 | 未采用 |
| Astro | ❌ 动态内容支持有限 | 未采用 |

### 7.2 样式方案选择

| 方案 | 评估 | 选择 |
|------|------|------|
| Tailwind CSS 4 | ✅ 开发快、包体积小、一致性强 | **已采用** |
| Styled Components | ❌ 运行时开销、SSR 复杂 | 未采用 |
| CSS Modules | ❌ 需要手动管理 | 未采用 |

### 7.3 数据库选择

| 方案 | 评估 | 选择 |
|------|------|------|
| Supabase | ✅ PostgreSQL、实时 API、免费额度大 | **已采用** |
| PlanetScale | ❌ 无免费实时 API | 未采用 |
| MongoDB Atlas | ❌ 关系型查询弱 | 未采用 |

### 7.4 AI 服务选择

| 方案 | 成本 | 质量 | 选择 |
|------|------|------|------|
| DeepSeek-V3 | ¥0.002/1K | 优秀 | **已采用** |
| GPT-4 | $0.03/1K | 优秀 | 备用方案 |
| Claude 3 | $0.008/1K | 优秀 | 备用方案 |

**选择 DeepSeek 理由:**
- 成本最低 (约为 GPT-4 的 1/15)
- 中文处理能力优秀
- API 稳定可靠

---

## 8. 架构图

### 8.1 系统架构

```
用户 (浏览器/移动端)
    ↓
Vercel Edge Network (CDN)
    ↓
Next.js App (Serverless Functions)
    ├── Server Components (数据获取)
    ├── Client Components (交互)
    └── API Routes (业务逻辑)
    ↓
    ┌────────────┬────────────┬────────────┐
    ↓            ↓            ↓            ↓
Supabase    DeepSeek       FMP API      (其他)
(PostgreSQL)   API        (数据源)
```

### 8.2 数据流

```
数据获取流程:
FMP API → GitHub Actions → Supabase → Next.js → 用户
                    ↓
              DeepSeek AI → AI 分析结果

用户请求流程:
用户 → Next.js API Route → Supabase → 响应
```

---

## 9. 性能指标

### 9.1 目标性能

| 指标 | 目标 | 测量工具 |
|------|------|----------|
| 首屏加载时间 (FCP) | < 1.5s | Vercel Analytics |
| 可交互时间 (TTI) | < 2.5s | Vercel Analytics |
| API 响应时间 (P95) | < 300ms | Vercel Logs |
| 累积布局偏移 (CLS) | < 0.1 | Vercel Analytics |

### 9.2 优化策略

**已实现:**
- ✅ Server Components 减少客户端 JS
- ✅ 图片优化 (next/image)
- ✅ 代码分割 (动态导入)
- ✅ 边缘缓存 (ISR)

**待实现:**
- ⏳ 数据库查询优化
- ⏳ 图片 WebP 格式
- ⏳ Service Worker 缓存

---

## 10. 安全规范

### 10.1 数据安全

- ✅ 所有 API 端点验证输入 (Zod)
- ✅ 数据库使用 RLS 策略
- ✅ 敏感操作需要认证
- ✅ 环境变量不暴露给客户端

### 10.2 应用安全

- ✅ HTTPS 强制
- ✅ Content Security Policy
- ✅ XSS 防护 (React 自动转义)
- ✅ CSRF 防护 (SameSite cookies)

---

## 11. 技术债务与演进

### 11.1 当前技术债务

- 部分类型定义需要完善
- 测试覆盖率需要提升
- 错误处理需要统一

### 11.2 未来演进方向

| 方向 | 计划时间 | 说明 |
|------|----------|------|
| 向量搜索 | Plan 4 | Supabase Vector 语义搜索 |
| 边缘函数 | Plan 4 | Vercel Edge Functions |
| 实时推送 | Plan 5 | WebSocket 实时更新 |
| 缓存层 | Plan 5 | Redis/Vercel KV |

---

## 12. 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-02-17 | 初始版本 |
| 2.0 | 2026-02-18 | 锁定确切版本号，添加架构图 |
| 2.1 | 2026-02-26 | 同步当前依赖版本并校正文档示例 |

---

**相关文档:**
- [AGENTS.md](../AGENTS.md) - AI 操作手册
- [PRD.md](./PRD.md) - 产品需求
- [APP_FLOW.md](./APP_FLOW.md) - 应用流程
- [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) - 前端规范
- [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - 后端架构
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 实施指南
