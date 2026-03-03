# JavaScript 核心语法（项目里会反复看到）

## 变量

```js
const symbol = "AAPL";
let count = 0;
```

规则：默认 `const`，会变化再用 `let`。

## 函数

```js
function format(v) {
  return `$${v}`;
}

const format2 = (v) => `$${v}`;
```

## 数组处理

```js
const arr = ["aapl", "msft", "nvda"];
const upper = arr.map((x) => x.toUpperCase());
const mOnly = upper.filter((x) => x.startsWith("M"));
```

## 对象解构

```js
const company = { symbol: "AAPL", name: "Apple" };
const { symbol, name } = company;
```

## 异步

```js
async function load() {
  const res = await fetch("/api/companies");
  return res.json();
}
```

## 错误处理

```js
try {
  const data = await load();
} catch (e) {
  console.error(e);
}
```

