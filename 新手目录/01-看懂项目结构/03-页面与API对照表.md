# 页面与 API 对照表

## 常见页面

1. `/` -> `src/app/page.tsx`
2. `/home` -> `src/app/home/page.tsx`
3. `/companies` -> `src/app/companies/page.tsx`
4. `/assistant` -> `src/app/assistant/page.tsx`
5. `/portfolio` -> `src/app/portfolio/page.tsx`

## 常见 API

1. `/api/health` -> `src/app/api/health/route.ts`
2. `/api/companies` -> `src/app/api/companies/route.ts`
3. `/api/stock-price/[symbol]` -> `src/app/api/stock-price/[symbol]/route.ts`
4. `/api/assistant/chat` -> `src/app/api/assistant/chat/route.ts`
5. `/api/portfolio` -> `src/app/api/portfolio/route.ts`

## 如何通过路径反推文件

规则：

1. 页面：`src/app/<route>/page.tsx`
2. API：`src/app/api/<route>/route.ts`
3. 动态参数：`[param]` 文件夹表示

