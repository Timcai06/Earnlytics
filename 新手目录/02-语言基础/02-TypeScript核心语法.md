# TypeScript 核心语法（从项目代码出发）

## 什么是 TypeScript

TypeScript = JavaScript + 类型系统。

它帮你在“运行前”发现更多错误。

## 基础类型

```ts
const name: string = "Apple";
const price: number = 229.87;
const ok: boolean = true;
```

## 对象类型

```ts
type Company = {
  id: number;
  symbol: string;
  name: string;
  sector: string | null;
};
```

## 可选字段

```ts
type User = {
  id: string;
  nickname?: string;
};
```

## 联合类型

```ts
type Sentiment = "positive" | "neutral" | "negative";
```

## 函数类型

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

## 泛型（先看懂，不急着会写）

```ts
const list: Array<string> = ["AAPL", "MSFT"];
```

## 空值安全

```ts
function formatRevenue(v: number | null): string {
  if (v === null) return "N/A";
  return `$${v.toLocaleString()}`;
}

const name = company?.name ?? "Unknown";
```

## 运行时校验（为什么项目用了 zod）

1. TS 只在编译时生效
2. API 真正收到的输入仍可能是脏数据
3. 所以 `zod` 用来做运行时校验

