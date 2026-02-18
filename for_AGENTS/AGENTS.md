# AGENTS.md - AI 助手操作手册

**版本:** 2.0  
**更新日期:** 2026-02-18  
**适用对象:** AI 编程助手 (Claude, Cursor, Kimi, etc.)  
**必读要求:** 每次会话开始前必须完整阅读本文档

---

## 零、会话启动检查清单

**AI 助手，在开始任何工作之前，请完成以下步骤：**

1. ✅ 阅读本文件 (AGENTS.md) - 你正在做
2. ✅ 阅读 `progress.txt` 了解当前进度
3. ✅ 检查当前工作目录位置
4. ✅ 确认用户请求的任务类型
5. ✅ 根据任务类型，阅读对应的规范文档

---

## 一、项目身份识别

```yaml
项目名称: Earnlytics
项目类型: AI 驱动的美国科技公司财报分析平台
目标用户: 中文美股投资者
技术架构: Next.js 16 + React 19 + TypeScript 5 + Supabase
部署平台: Vercel Serverless
```

---

## 二、绝对禁止清单 (NEVER DO)

**以下操作严格禁止，违反任何一条都会导致代码被拒绝：**

### 2.1 代码质量红线
- ❌ **绝不使用 `as any`** - 必须提供正确的类型定义
- ❌ **绝不使用 `@ts-ignore` 或 `@ts-expect-error`** - 必须修复类型错误
- ❌ **绝不硬编码敏感信息** - API 密钥、密码必须来自环境变量
- ❌ **绝不提交 `.env.local` 到 Git**
- ❌ **绝不在前端代码中暴露服务端密钥**

### 2.2 架构红线
- ❌ **绝不在根目录运行 `create-next-app`** (会创建重复配置)
- ❌ **绝不随意添加新依赖** - 必须使用 TECH_STACK.md 中已定义的包
- ❌ **绝不修改核心配置文件** (next.config.ts, tsconfig.json) 除非明确授权
- ❌ **绝不在生产代码中使用 `console.log`** - 使用适当的日志工具

### 2.3 代码风格红线
- ❌ **绝不使用内联样式** (`style={{...}}`) - 必须使用 Tailwind CSS
- ❌ **绝不使用 Emoji** 作为图标 - 必须使用 SVG (Lucide 或自定义)
- ❌ **绝不创建巨型组件** (>300 行) - 必须拆分成小组件
- ❌ **绝不混合服务端和客户端逻辑** - 必须明确区分 Server/Client Components

---

## 三、必须遵守的规范 (ALWAYS DO)

### 3.1 文档优先原则
**在任何编码之前，必须先确认：**
1. 相关规范文档已阅读并理解
2. 该功能在 PRD.md 中有定义
3. 实施步骤在 IMPLEMENTATION.md 中有规划
4. 设计在 FRONTEND_GUIDELINES.md 中有规范
5. 数据结构在 BACKEND_STRUCTURE.md 中有定义

### 3.2 代码提交规范
**每次完成一个功能后，必须：**
1. 更新 `progress.txt` 文件
2. 运行 `npm run lint` 检查代码
3. 运行 `npm run build` 确保构建成功
4. 提交代码: `git add . && git commit -m "feat: 具体描述"`

### 3.3 类型安全规范
- ✅ 所有函数必须有返回类型声明
- ✅ 所有 Props 必须有 Interface/Type 定义
- ✅ 所有 API 响应必须有类型定义
- ✅ 使用 `unknown` 而不是 `any` 当类型不确定时

### 3.4 组件开发规范
- ✅ 使用默认导出 (`export default`)
- ✅ 文件名使用 PascalCase (如 `Button.tsx`)
- ✅ 客户端组件必须在文件顶部添加 `"use client"`
- ✅ 使用 `cn()` 工具函数合并类名
- ✅ Props 接口命名: `{ComponentName}Props`

---

## 四、技术栈锁定 (LOCKED)

**以下技术栈已确定，未经许可不得更改：**

### 4.1 核心框架
```yaml
Next.js: 16.1.6
React: 19.2.3
TypeScript: 5.7.3
Node.js: 20.x+
```

### 4.2 样式系统
```yaml
Tailwind CSS: 4.0.0
shadcn/ui: latest
class-variance-authority: latest
clsx: latest
tailwind-merge: latest
```

### 4.3 UI 组件
```yaml
Lucide React: 0.475.0
Framer Motion: 12.4.0
Recharts: 2.15.0
```

### 4.4 后端服务
```yaml
Supabase (PostgreSQL): @supabase/supabase-js ^2.48.0
DeepSeek API: deepseek-chat (DeepSeek-V3)
FMP API: financialmodelingprep.com
```

### 4.5 开发工具
```yaml
ESLint: 9.x
Jest: 29.x
React Testing Library: 16.x
node-fetch: 2.x (for testing)
```

**添加新依赖的规则：**
1. 必须在 TECH_STACK.md 中记录
2. 必须说明添加理由
3. 必须检查与现有依赖的兼容性

---

## 五、文件命名与组织规范

### 5.1 命名约定
| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件文件 | PascalCase | `Button.tsx`, `Header.tsx` |
| Hook 文件 | camelCase | `useAuth.ts`, `useDebounce.ts` |
| 工具函数 | camelCase | `formatDate.ts`, `cn.ts` |
| 类型定义 | PascalCase | `types/earnings.ts` |
| API 路由 | camelCase | `route.ts` (在文件夹内) |
| 常量 | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |

### 5.2 目录结构 (必须严格遵守)
```
earnlytics-web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 路由组: 认证页面
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── earnings/
│   │   ├── companies/
│   │   └── ...
│   ├── earnings/[symbol]/        # 动态路由: 财报详情
│   ├── analysis/[symbol]/        # 动态路由: 投资分析
│   ├── companies/                # 公司列表
│   ├── calendar/                 # 财报日历
│   └── ...
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── layout/                   # 布局组件 (Header, Footer)
│   ├── home/                     # 首页专属组件
│   ├── investment/               # 投资分析组件
│   └── icons/                    # SVG 图标
├── lib/                          # 工具库
│   ├── supabase.ts               # Supabase 客户端
│   ├── ai.ts                     # AI 服务封装
│   ├── utils.ts                  # 通用工具 (cn函数)
│   └── ...
├── hooks/                        # 自定义 Hooks
├── types/                        # TypeScript 类型定义
└── styles/                       # 全局样式
```

**禁止创建的目录：**
- ❌ `src/utils/` (使用 `src/lib/`)
- ❌ `src/assets/` (静态资源放 `public/`)
- ❌ `src/helpers/` (功能合并到 `src/lib/`)

---

## 六、设计系统令牌

**所有视觉实现必须遵循以下令牌，不得自行发明数值：**

### 6.1 颜色系统
```typescript
// 主色调
primary: '#6366f1'           // 靛蓝色
primary-foreground: '#ffffff'

// 背景色
background: '#0a0a0f'       // 深色背景
foreground: '#fafafa'       // 主要文字

// 卡片/表面
card: '#12121a'
card-foreground: '#fafafa'

// 边框和分隔线
border: 'rgba(255, 255, 255, 0.1)'
muted: 'rgba(255, 255, 255, 0.6)'

// 功能色
destructive: '#ef4444'      // 错误/删除
success: '#22c55e'          // 成功
warning: '#f59e0b'          // 警告
```

### 6.2 间距系统 (4px 基准)
```typescript
spacing: {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
}
```

### 6.3 圆角系统
```typescript
borderRadius: {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',   // 圆形
}
```

### 6.4 字体系统
```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}

fontSize: {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
}
```

### 6.5 设计风格关键词
当用户要求特定风格时，使用以下术语：
- **Glassmorphism** - 磨砂玻璃效果: `backdrop-filter: blur(10px)`, 半透明背景
- **Bento Grid** - 模块化网格布局，不同大小的卡片
- **Dark Mode** - 默认暗黑模式，柔和的强调色
- **Micro-interactions** - 悬停、点击的微动画 (Framer Motion)

---

## 七、组件开发模式

### 7.1 shadcn/ui 组件模板
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 7.2 页面组件模板 (Server Component)
```tsx
import { Metadata } from "next"
import { supabase } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "页面标题 | Earnlytics",
  description: "页面描述",
}

// 服务端数据获取
async function getData() {
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
  
  if (error) {
    throw new Error("Failed to fetch data")
  }
  
  return data
}

export default async function PageName() {
  const data = await getData()
  
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">页面标题</h1>
      {/* 组件内容 */}
    </main>
  )
}
```

### 7.3 客户端组件模板
```tsx
"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ComponentNameProps {
  title: string
  className?: string
  onAction?: () => void
}

export function ComponentName({ 
  title, 
  className,
  onAction 
}: ComponentNameProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {/* 组件内容 */}
    </div>
  )
}
```

---

## 八、API 开发模式

### 8.1 标准 API Route 模板
```typescript
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

// 输入验证 schema
const requestSchema = z.object({
  symbol: z.string().min(1).max(10),
})

export async function GET(request: Request) {
  try {
    // 检查数据库连接
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }
    
    // 解析参数
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    
    // 验证输入
    const validation = requestSchema.safeParse({ symbol })
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid symbol parameter" },
        { status: 400 }
      )
    }
    
    // 查询数据库
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .eq("symbol", symbol?.toUpperCase())
      .single()
    
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### 8.2 API 错误响应标准
```typescript
// 标准错误响应格式
{
  "error": "错误描述",
  "status": 400,
  "details": "详细错误信息 (可选)"
}

// 常见状态码使用
200 - 成功
400 - 请求参数错误
401 - 未授权 (需要登录)
404 - 资源不存在
429 - 请求过于频繁
500 - 服务器内部错误
```

---

## 九、数据库操作模式

### 9.1 Supabase 查询模板
```typescript
// 基础查询
const { data, error } = await supabase
  .from("companies")
  .select("*")

// 条件查询
const { data } = await supabase
  .from("earnings")
  .select("*")
  .eq("symbol", symbol)
  .order("report_date", { ascending: false })
  .limit(10)

// 关联查询
const { data } = await supabase
  .from("earnings")
  .select(`
    *,
    companies(name, sector)
  `)
  .eq("symbol", symbol)
  .single()

// 插入数据
const { data, error } = await supabase
  .from("subscribers")
  .insert({
    email: "user@example.com",
    is_active: true,
  })
  .select()
  .single()
```

### 9.2 错误处理模式
```typescript
// 必须处理的数据库错误类型
PGRST116 - 记录不存在 (返回 404)
23505 - 唯一约束冲突 (返回 409)
23503 - 外键约束失败 (返回 400)
```

---

## 十、工作流程指令

### 10.1 添加新功能的完整流程

**步骤 1: 规划阶段**
1. 阅读 PRD.md，确认功能需求
2. 阅读 APP_FLOW.md，了解用户流程
3. 阅读 IMPLEMENTATION.md，找到实施步骤
4. 如果需要新数据，阅读 BACKEND_STRUCTURE.md
5. 确认设计规范在 FRONTEND_GUIDELINES.md 中

**步骤 2: 设计阶段**
1. 根据 FRONTEND_GUIDELINES.md 确定视觉风格
2. 确认使用的组件在 shadcn/ui 中或需要自定义
3. 确认颜色、间距使用设计令牌

**步骤 3: 开发阶段**
1. 创建/修改组件文件
2. 遵循命名规范和组件模板
3. 添加类型定义
4. 实现功能逻辑

**步骤 4: 测试阶段**
1. 运行 `npm run lint` 检查代码
2. 运行 `npm run build` 确保构建成功
3. 手动测试功能
4. 如有测试，运行 `npm test`

**步骤 5: 提交阶段**
1. 更新 `progress.txt` 文件
2. 提交代码: `git add . && git commit -m "feat: 功能描述"`
3. 如果需要，推送到远程

### 10.2 调试工作流

当代码出现问题时：
1. **阅读错误信息** - 找到确切的文件和行号
2. **检查类型** - 运行 `npx tsc --noEmit`
3. **检查代码** - 对照本规范检查是否违反规则
4. **修复问题** - 应用修复
5. **验证修复** - 重新构建和测试

---

## 十一、与其他文档的引用关系

**本文档 (AGENTS.md) 是主入口，但必须与其他文档配合使用：**

| 文档 | 何时阅读 | 用途 |
|------|---------|------|
| `progress.txt` | 每次会话开始 | 了解当前进度和上下文 |
| `PRD.md` | 添加新功能前 | 确认功能需求和验收标准 |
| `APP_FLOW.md` | 开发用户流程时 | 了解页面流转和交互 |
| `TECH_STACK.md` | 需要技术细节时 | 查看确切版本和技术选型 |
| `FRONTEND_GUIDELINES.md` | 开发 UI 时 | 查看设计系统和组件示例 |
| `BACKEND_STRUCTURE.md` | 开发 API/数据库时 | 查看数据模型和 API 合约 |
| `IMPLEMENTATION.md` | 实施功能时 | 查看详细步骤和故障排除 |

**引用格式示例：**
- "根据 PRD.md 第 2.1.3 节，投资分析工具需要..."
- "按照 FRONTEND_GUIDELINES.md 的颜色系统，使用 primary: '#6366f1'"
- "参考 BACKEND_STRUCTURE.md 的 API 响应格式..."

---

## 十二、AI 助手自我改进机制

**当 AI 助手犯错时，请按以下流程处理：**

1. **识别错误模式** - 分析为什么会出错
2. **更新本文档** - 在"禁止清单"或"必须遵守"中添加新规则
3. **记录到 progress.txt** - 记录问题和解决方案
4. **应用修复** - 修复当前问题

**示例：**
- 错误: 使用了内联样式 style={{color: 'red'}}
- 修复: 改用 Tailwind className="text-red-500"
- 文档更新: 在 2.2 节添加 "绝不使用内联样式"

---

## 十三、快速参考卡

### 常用命令
```bash
# 开发
npm run dev              # 启动开发服务器 (localhost:3000)

# 代码检查
npm run lint             # ESLint 检查
npx tsc --noEmit         # TypeScript 类型检查

# 构建
npm run build            # 生产构建

# 测试
npm test                 # 运行所有测试
npm test -- path/to/file # 运行单个测试文件

# 数据操作
npm run fetch:earnings   # 获取最新财报
npm run analyze:batch    # 批量 AI 分析
```

### 文件路径速查
- 添加页面: `src/app/[page-name]/page.tsx`
- 添加 API: `src/app/api/[endpoint]/route.ts`
- 添加组件: `src/components/[category]/[ComponentName].tsx`
- 添加工具: `src/lib/[utility].ts`
- 添加 Hook: `src/hooks/[useHookName].ts`

### 设计令牌速查
- 主色: `#6366f1`
- 背景: `#0a0a0f`
- 卡片: `#12121a`
- 边框: `rgba(255, 255, 255, 0.1)`
- 文字: `#fafafa`
- 次要文字: `rgba(255, 255, 255, 0.6)`

---

**文档结束**

**AI 助手，你现在已了解 Earnlytics 项目的完整规范。请严格遵循本文档的规则和模式进行开发。**

**每次完成工作后，记得更新 `progress.txt`！**
