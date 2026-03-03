# Next.js App Router 基础

## 路由规则

1. `src/app/page.tsx` -> `/`
2. `src/app/home/page.tsx` -> `/home`
3. `src/app/api/companies/route.ts` -> `/api/companies`
4. `src/app/api/stock-price/[symbol]/route.ts` -> `/api/stock-price/AAPL`

## 页面与 API 的区别

1. 页面返回 HTML/React 视图
2. API 返回 JSON

## layout.tsx 的作用

`src/app/layout.tsx` 负责全局外壳：

1. 全局样式
2. 字体
3. SEO metadata
4. 全局客户端布局组件

## 动态路由

`[symbol]` 表示参数位。

例如 `/api/stock-price/AAPL` 中的 `AAPL` 会传到 `params.symbol`。

## 缓存与 revalidate

项目里 `src/app/home/page.tsx` 使用了 `revalidate = 300` 和 `unstable_cache`，
目的是减少重复查询，提高页面速度。

