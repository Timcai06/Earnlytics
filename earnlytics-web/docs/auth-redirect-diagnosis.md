# 登录态抖动与页面反复跳转诊断（2026-03-01）

## 现象
- 部分页面（如 `/portfolio`、`/profile`、`/login`）出现不稳定跳转。
- 表现为登录态时有时无，用户在受保护页与登录页之间往返。

## 根因分析
- 并发 session 校验请求：
  - `Header`、页面组件、功能组件会同时调用 `useAuthUser()`。
  - 访问 token 过期时，多个 `/api/auth/session` 请求并发触发 refresh。
- refresh 竞争导致会话抖动：
  - 并发 refresh 使用同一旧 refresh token 时，部分请求可能失败。
  - 失败分支若清 cookie，会把成功刷新后的 cookie 覆盖清空，导致“已登录->未登录”抖动。
- 前端 401 处理不一致：
  - 部分页面收到 401 仅跳转，不先清理本地 `user` 缓存，容易短时间内出现状态不一致。

## 已实施修复
- 客户端 session 请求全局去重与短时缓存：
  - 文件：`src/lib/auth/client.ts`
  - `fetchSessionUser` 增加 in-flight 去重，避免多组件并发打爆 `/api/auth/session`。
- `useAuthUser` 错误处理优化：
  - 文件：`src/hooks/use-auth-user.ts`
  - 网络异常时不立刻清空本地用户，降低误判登出概率。
- 禁止 `GET /api/auth/session` 在 401 时主动清 cookie：
  - 文件：`src/app/api/auth/session/route.ts`
  - 避免并发请求中的失败响应覆盖成功刷新后的 cookie。
- 受保护页统一 401 跳转策略：
  - 文件：`src/app/portfolio/PortfolioPageClient.tsx`
  - 401 时先 `writeLocalUser(null)`，再跳转登录页。
- 登录页默认回跳目标优化：
  - 文件：`src/app/(auth)/login/LoginPageClient.tsx`
  - 未指定 `next` 时默认回到 `/home`，避免先进入受保护页再被打回。

## 第二点落地（安全补齐）
- `alerts` API 改为服务端 session 鉴权（移除前端 `userId` 信任）：
  - 文件：`src/app/api/alerts/route.ts`
- `assistant/chat` API 改为服务端 session 鉴权并校验会话归属：
  - 文件：`src/app/api/assistant/chat/route.ts`
- `ChatInterface` 不再上送 `userId/sessionId`：
  - 文件：`src/components/investment/ChatInterface.tsx`
- AI 聊天持久化改为优先 service role 客户端，规避 RLS 场景下写入失败：
  - 文件：`src/lib/ai/assistant.ts`

## 验证建议
- 过期 token 场景：
  - 登录后等待 access token 过期，再打开 `/portfolio`、`/profile`，确认不会反复来回跳转。
- 并发场景：
  - 同时打开多个标签页并刷新，确认登录态稳定。
- 聊天与提醒接口：
  - 未登录调用应返回 401。
  - 登录后接口正常返回，且不能跨用户读取会话数据。
