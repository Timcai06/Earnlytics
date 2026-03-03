# 首页与 Home 数据链路

## 两个入口

1. `/`：营销/引导页，入口文件 `src/app/page.tsx`
2. `/home`：数据主战场，入口文件 `src/app/home/page.tsx`

## `/home` 的完整链路

```text
GET /home
-> src/app/home/page.tsx
-> fetchHomePageData() in src/app/home/home-data.ts
-> 查询 earnings + companies + ai_analyses + stock prices
-> 返回 initialData
-> src/app/home/HomePageClient.tsx 渲染
```

## 你需要重点看什么

1. `home-data.ts`：数据组装
2. `HomePageClient.tsx`：页面渲染与交互
3. 动态导入 `dynamic(...)`：性能优化

## 常见疑问

1. 为什么分 page 和 client 两个文件？

答：

1. 服务端取数更安全、更快
2. 客户端交互更灵活

