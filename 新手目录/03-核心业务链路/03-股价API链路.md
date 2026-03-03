# 股价 API 链路（/api/stock-price/[symbol]）

## 入口文件

`src/app/api/stock-price/[symbol]/route.ts`

## 服务逻辑文件

`src/lib/stock-price-service.ts`

## 执行顺序

1. 先读取数据库里的最新缓存
2. 如果缓存未过期，直接返回
3. 如果过期，拉取实时行情并写回数据库
4. 若实时失败，回退旧缓存
5. 开发环境可选 mock 回退

## 这个接口体现了什么工程思路

1. 先快后新（先给用户快响应，再追求最新）
2. 多级兜底，减少接口失败率
3. 服务逻辑从 route.ts 抽离到 lib，便于复用

## 推荐练习

1. 打开 `/api/stock-price/AAPL` 看返回字段
2. 连续请求几次，对比 `source`/`cached` 字段

