# Vercel 部署流程（新手版）

## 从代码到线上的路径

```text
本地开发 -> push 到 GitHub -> Vercel 自动构建 -> 发布到线上域名
```

## 构建阶段发生了什么

1. 安装依赖
2. 执行 `next build`
3. 产出可部署产物
4. 发布新版本

## 你要关注的配置

1. Vercel 环境变量是否和 `.env.local` 对齐
2. 分支策略（一般 main 为生产）
3. 构建失败时查看 Vercel build logs

## 发布后验证清单

1. 打开首页 `/`
2. 打开数据页 `/home`
3. 打开接口 `/api/health`
4. 看控制台是否有关键报错

