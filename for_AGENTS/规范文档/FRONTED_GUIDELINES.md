# 前端开发规范

**更新日期:** 2026-02-27  
**版本:** 1.1

---

## 概述

Earnlytics 前端基于 Next.js 16 + React 19 + TypeScript 5，使用 Tailwind CSS 4 和 shadcn/ui 组件库。

---

## 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 组件 | shadcn/ui | latest |
| 图标 | Lucide React | 0.563 |
| 动画 | Framer Motion | 12.x |
| 图表 | Recharts | 2.x |

---

## 目录结构

```
src/
├── app/                          # App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── globals.css               # 全局样式
│   ├── (auth)/                   # 认证路由组
│   ├── api/                      # API Routes
│   ├── earnings/[symbol]/        # 财报详情
│   ├── analysis/[symbol]/        # 投资分析
│   ├── companies/                # 公司列表
│   ├── calendar/                 # 财报日历
│   └── ...
├── components/
│   ├── ui/                       # shadcn/ui 组件
│   ├── layout/                   # Header, Footer
│   ├── home/                     # 首页组件
│   ├── investment/               # 投资分析组件
│   └── icons/                    # SVG 图标库
└── lib/                          # 工具库
    ├── supabase.ts               # 数据库客户端
    ├── ai.ts                     # AI 服务集成
    ├── utils.ts                  # 工具函数
    └── ...
```

---

## 组件开发规范

### 命名规范

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件 | PascalCase | `Button.tsx`, `Header.tsx` |
| Hook | camelCase | `useAuth.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型定义 | PascalCase | `types/earnings.ts` |

**当前状态 (2026-02-26):**
- `src/components` 历史 kebab-case 组件文件已完成迁移到 `PascalCase`。
- 新增组件必须延续 `PascalCase`，不再新增 kebab-case 组件文件。

### 性能组件约定 (2026-02-27)

- 首屏之外的重组件优先 `dynamic import`。
- 使用 `src/components/performance/ViewportRender.tsx` 做可见区挂载。
- 对高频列表项组件使用 `memo`，并保证 props 稳定（`useMemo` 预处理映射数据）。
- 对大量详情链接禁用默认预取：`prefetch={false}`。
- 图片加载统一经过 `src/lib/image-optimization.ts` 策略判断，避免无意义 `unoptimized`。

### 重命名后排错

如果组件重命名后开发环境报旧路径（例如 `xxx-old-name.tsx`）：
1. 删除缓存：`rm -rf .next`
2. 重启开发服务器：`npm run dev`
3. 如编辑器仍报错，重启 TypeScript Server

### shadcn/ui 组件模板

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
      },
    },
  }
)

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

### 自定义组件结构

```tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export default function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Component JSX */}
    </header>
  );
}
```

### 数据获取组件示例

```tsx
// Server Component 获取数据
import { supabase } from "@/lib/supabase";

export default async function EarningsPage({ 
  params 
}: { 
  params: Promise<{ symbol: string }> 
}) {
  const { symbol } = await params;
  
  const { data: earnings } = await supabase
    .from("earnings")
    .select("*")
    .eq("symbol", symbol)
    .order("report_date", { ascending: false });

  return <EarningsList data={earnings} />;
}
```

### 客户端交互组件示例

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索公司或股票代码..."
        className="w-full px-4 py-2 rounded-lg border"
      />
    </form>
  );
}
```

### 列表渲染组件示例

```tsx
interface CompanyListProps {
  companies: Array<{
    id: number;
    symbol: string;
    name: string;
    sector: string;
  }>;
}

export function CompanyList({ companies }: CompanyListProps) {
  if (companies.length === 0) {
    return <EmptyState message="暂无公司数据" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
```

---

## 样式规范

### Tailwind CSS 使用

```tsx
// 基础类名
className="flex items-center justify-between px-4 py-2"

// 条件类名 (使用 cn 工具)
className={cn(
  "flex items-center",
  isActive && "bg-primary text-white",
  className
)}

// 响应式设计
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// 暗黑模式
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

### 设计系统 Token

```css
/* 颜色 */
--primary: #6366f1;
--primary-foreground: #ffffff;
--background: #0a0a0f;
--foreground: #fafafa;
--card: #12121a;
--card-foreground: #fafafa;
--border: rgba(255, 255, 255, 0.1);
--muted: rgba(255, 255, 255, 0.6);

/* 间距 */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */

/* 圆角 */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
```

### 常用样式组合

```tsx
// Card 样式
className="rounded-lg border bg-card p-6 shadow-sm"

// Button 样式
className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"

// Input 样式
className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// Layout 样式
className="container mx-auto px-4 py-8 max-w-7xl"
```

---

## 页面开发规范

### App Router 页面

```tsx
// app/page.tsx (Server Component)
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earnlytics - AI财报分析",
  description: "专业的AI财报分析平台...",
};

export default function HomePage() {
  return <main className="flex min-h-screen flex-col">...</main>;
}
```

### 动态路由

```tsx
// app/earnings/[symbol]/page.tsx
export default async function EarningsPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const earnings = await getEarnings(symbol);
  return <EarningsDetail earnings={earnings} />;
}
```

---

## 状态管理

### 本地状态

```tsx
const [count, setCount] = useState(0);
const [form, setForm] = useState({ email: "", password: "" });
```

### 全局状态 (Context)

```tsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 性能优化

### 图片优化

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={50}
  priority
/>
```

### 代码分割

```tsx
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Skeleton />,
});
```

---

## 开发规范

### 必须遵守
- ✅ 使用 TypeScript 严格模式
- ✅ 组件使用默认导出
- ✅ Props 添加类型定义
- ✅ 使用 Path Alias (`@/components`)

### 禁止操作
- ❌ 使用 `as any` 或 `@ts-ignore`
- ❌ 使用 emoji 作为图标 (使用 SVG)
- ❌ 在 Server Component 中使用浏览器 API

---

**相关文档:**
- [后端架构](./BACKEND_STRUCTURE.md)
- [应用流程](./APP_FLOW.md)
- [实施指南](./IMPLEMENTATION.md)

---

## 附录 A: 设计令牌参考

### A.1 CSS 变量定义

**全局 CSS 变量 (globals.css):**
```css
:root {
  /* 主色调 */
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --primary-hover: #4f46e5;
  --primary-muted: rgba(99, 102, 241, 0.1);

  /* 背景色 */
  --background: #0a0a0f;
  --foreground: #fafafa;
  --background-secondary: #12121a;
  --background-tertiary: #1a1a24;

  /* 卡片和表面 */
  --card: #12121a;
  --card-foreground: #fafafa;
  --card-hover: #1a1a24;

  /* 边框和分隔线 */
  --border: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);
  --divider: rgba(255, 255, 255, 0.05);

  /* 文字颜色 */
  --text-primary: #fafafa;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-disabled: rgba(255, 255, 255, 0.4);

  /* 功能色 */
  --success: #22c55e;
  --success-foreground: #ffffff;
  --warning: #f59e0b;
  --warning-foreground: #000000;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --info: #3b82f6;
  --info-foreground: #ffffff;

  /* 间距系统 */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* 圆角 */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;

  /* 字体 */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* 字体大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);

  /* 过渡 */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Z-index 层级 */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-toast: 700;
  --z-tooltip: 800;
}
```

### A.2 Tailwind 配置扩展

**tailwind.config.ts 完整配置:**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
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
          hover: "#4f46e5",
          muted: "rgba(99, 102, 241, 0.1)",
        },
        background: "#0a0a0f",
        foreground: "#fafafa",
        card: {
          DEFAULT: "#12121a",
          foreground: "#fafafa",
          hover: "#1a1a24",
        },
        border: "rgba(255, 255, 255, 0.1)",
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.6)",
          foreground: "rgba(255, 255, 255, 0.4)",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#000000",
        },
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 附录 B: 常用组件模式

### B.1 卡片组件变体

```tsx
// 基础卡片
<div className="rounded-lg border bg-card p-6">
  <h3 className="text-lg font-semibold">卡片标题</h3>
  <p className="text-muted-foreground mt-2">卡片内容</p>
</div>

// 可点击卡片
<div className="rounded-lg border bg-card p-6 cursor-pointer 
                transition-colors hover:bg-card-hover">
  {/* 内容 */}
</div>

// 带阴影卡片 (强调)
<div className="rounded-lg border bg-card p-6 shadow-lg">
  {/* 内容 */}
</div>

// 玻璃拟态卡片
<div className="rounded-lg border bg-card/80 backdrop-blur-md p-6">
  {/* 内容 */}
</div>
```

### B.2 按钮变体

```tsx
// 主要按钮
<button className="inline-flex items-center justify-center 
                   rounded-md bg-primary px-4 py-2 
                   text-sm font-medium text-primary-foreground
                   transition-colors hover:bg-primary-hover
                   disabled:opacity-50 disabled:pointer-events-none">
  按钮文字
</button>

// 次要按钮 (描边)
<button className="inline-flex items-center justify-center
                   rounded-md border border-input bg-background
                   px-4 py-2 text-sm font-medium
                   transition-colors hover:bg-accent">
  次要按钮
</button>

// 幽灵按钮
<button className="inline-flex items-center justify-center
                   rounded-md px-4 py-2 text-sm font-medium
                   transition-colors hover:bg-accent">
  幽灵按钮
</button>

// 危险按钮
<button className="inline-flex items-center justify-center
                   rounded-md bg-destructive px-4 py-2
                   text-sm font-medium text-destructive-foreground
                   transition-colors hover:bg-destructive/90">
  删除
</button>
```

### B.3 表单输入模式

```tsx
// 输入框组
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">
    邮箱地址
  </label>
  <input
    type="email"
    className="flex h-10 w-full rounded-md border border-input
               bg-background px-3 py-2 text-sm
               placeholder:text-muted-foreground
               focus-visible:outline-none 
               focus-visible:ring-2 focus-visible:ring-ring"
    placeholder="your@email.com"
  />
  <p className="text-xs text-muted-foreground">
    我们将不会分享您的邮箱
  </p>
</div>

// 带错误状态的输入框
<div className="space-y-2">
  <label className="text-sm font-medium">密码</label>
  <input
    type="password"
    className="flex h-10 w-full rounded-md border 
               border-destructive bg-background px-3 py-2"
  />
  <p className="text-xs text-destructive">
    密码必须至少8位
  </p>
</div>
```

### B.4 布局模式

```tsx
// 容器布局
<div className="container mx-auto px-4 py-8 max-w-7xl">
  {/* 内容 */}
</div>

// 网格布局 (Bento Grid)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">{/* 大卡片 */}</div>
  <div>{/* 小卡片 */}</div>
  <div>{/* 小卡片 */}</div>
  <div>{/* 小卡片 */}</div>
</div>

// 弹性布局 (标题栏)
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">页面标题</h1>
  <div className="flex items-center gap-4">
    <button>操作1</button>
    <button>操作2</button>
  </div>
</div>

// 侧边栏布局
<div className="flex min-h-screen">
  <aside className="w-64 border-r bg-card">
    {/* 侧边栏内容 */}
  </aside>
  <main className="flex-1 p-8">
    {/* 主内容 */}
  </main>
</div>
```

---

## 附录 C: 响应式设计规范

### C.1 断点定义

```typescript
// Tailwind 默认断点
sm: 640px   // 手机横屏
md: 768px   // 平板竖屏
lg: 1024px  // 平板横屏/小笔记本
xl: 1280px  // 桌面
2xl: 1536px // 大屏桌面
```

### C.2 响应式模式

```tsx
// 字体大小响应式
<h1 className="text-xl md:text-2xl lg:text-3xl">
  响应式标题
</h1>

// 间距响应式
<div className="p-4 md:p-6 lg:p-8">
  内容
</div>

// 布局响应式 (手机堆叠，桌面并排)
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">侧边栏</div>
  <div className="w-full md:w-2/3">主内容</div>
</div>

// 网格响应式
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// 显示/隐藏响应式
<div className="hidden md:block">
  只在桌面显示
</div>
<div className="md:hidden">
  只在手机显示
</div>
```

### C.3 移动优先设计原则

1. **先设计移动端** - 确保核心内容在小屏幕上可见
2. **渐进增强** - 大屏幕添加额外功能和布局
3. **触摸友好** - 按钮最小 44x44px，间距足够
4. **性能优先** - 移动端减少动画和重资源

---

## 附录 D: 动画规范

### D.1 微交互动画

```tsx
// 按钮悬停
<button className="transition-all duration-200 
                   hover:scale-105 active:scale-95">
  点击我
</button>

// 卡片悬停
<div className="transition-all duration-300 
               hover:shadow-lg hover:-translate-y-1">
  卡片内容
</div>

// 输入框聚焦
<input className="transition-all duration-200
                  focus:ring-2 focus:ring-primary/50" />
```

### D.2 Framer Motion 模式

```tsx
import { motion } from "framer-motion";

// 页面进入动画
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  页面内容
</motion.div>

// 列表项动画
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.1 }}
>
  列表项
</motion.div>

// 悬停动画
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  交互按钮
</motion.button>

// 模态框动画
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  模态框内容
</motion.div>
```

---

**文档结束**
