# React 与 TSX 基础

## 组件是什么

组件就是函数，返回 JSX。

```tsx
export default function Page() {
  return <div>Hello</div>;
}
```

## Props（组件输入）

```tsx
type CardProps = { title: string };

function Card({ title }: CardProps) {
  return <h2>{title}</h2>;
}
```

## 状态管理 useState

```tsx
const [query, setQuery] = useState("");
```

## 副作用 useEffect

```tsx
useEffect(() => {
  console.log("mounted");
}, []);
```

## 计算缓存 useMemo

```tsx
const filtered = useMemo(() => list.filter((x) => x.ok), [list]);
```

## 为什么有 "use client"

在 Next.js 里，默认是服务端组件。要用状态/事件，必须加：

```tsx
"use client";
```

项目示例：`src/app/home/HomePageClient.tsx`。

