# RAG 对话系统集成方案

**创建日期**: 2026-02-21  
**目标**: 为 Earnlytics 集成完整的 AI 对话助手，支持基于财报数据的智能问答

---

## 一、现状分析

### 1.1 已具备条件

| 组件 | 状态 | 说明 |
|------|------|------|
| `document_embeddings` 表 | ✅ 已创建 | 存储向量数据 (pgvector) |
| `chat_conversations` 表 | ✅ 已创建 | 对话历史 |
| `chat_messages` 表 | ✅ 已创建 | 消息记录 |
| `/api/assistant/chat` | ✅ 已完成 | 完整 RAG 对话功能 |
| `ChatInterface` 组件 | ✅ 已创建 | 前端对话 UI |
| `pgvector` 扩展 | ✅ 已安装 | 向量相似度搜索 |
| `generate-embeddings.ts` | ✅ 已创建 | 向量生成脚本 |
| 向量数据 | ✅ 已填充 | document_embeddings 表有数据 |
| `/assistant` 页面 | ✅ 已创建 | AI 助手入口页面 |
| Header 导航入口 | ✅ 已添加 | AI 助手按钮 |

---

## 二、目标功能

### 2.1 核心功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户可通过导航栏进入 AI 对话助手 | ✅ 已完成 | `/assistant` 页面 |
| AI 可以基于已分析的财报数据回答问题 | ✅ 已完成 | RAG 检索已实现 |
| 支持对话历史，用户可回顾之前的对话 | ✅ 已完成 | `chat_conversations` + `chat_messages` |
| 支持语义搜索，找到相关的财报内容 | ✅ 已完成 | `search_documents` RPC |

### 2.2 用户体验

```
用户场景：
1. 点击 Header「AI 助手」入口
2. 进入 /assistant 页面
3. 输入「微软最近的财报表现如何」
4. AI 检索相关财报向量数据
5. 生成基于真实数据的回答
6. 对话内容保存到数据库
```

---

## 三、技术架构

### 3.1 系统架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Frontend   │────▶│  API Route   │────▶│  DeepSeek API  │
│  ChatUI     │     │  /assistant  │     │  + RAG 检索    │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                       │
                           ▼                       ▼
                    ┌──────────────┐     ┌─────────────────┐
                    │  Supabase    │     │  PGVector      │
                    │  Chat History│     │  Embeddings    │
                    └──────────────┘     └─────────────────┘
```

### 3.2 数据流

```
1. 用户提问 → API
2. 将问题转为向量 → text-embedding-3-small
3. 向量相似度搜索 → document_embeddings
4. 提取 Top-K 相关内容
5. 构建 Prompt (上下文 + 用户问题)
6. 调用 DeepSeek API
7. 返回答案 + 保存对话到数据库
```

---

## 四、实施计划

### Phase 1: 数据准备 ✅ 已完成

#### 任务 1.1: 创建向量生成脚本 ✅

**文件**: `scripts/generate-embeddings.ts`

**功能**:
- 扫描 `ai_analyses` 表中的分析内容
- 扫描 `earnings` 表中的财报数据
- 使用 Cohere text-embedding-3-large 生成向量
- 批量存入 `document_embeddings` 表

**执行命令**:
```bash
cd earnlytics-web && npm run generate:embeddings
```

#### 任务 1.2: 验证向量检索 ✅

```sql
-- 测试向量搜索
SELECT content_chunk, 
  1 - (embedding <=> $query_vector) as similarity
FROM document_embeddings
WHERE similarity > 0.7
ORDER BY similarity DESC
LIMIT 5
```

---

### Phase 2: RAG 核心实现 ✅ 已完成

#### 任务 2.1: 增强 `/api/assistant/chat` API ✅

**文件**: `src/app/api/assistant/chat/route.ts`

**核心逻辑** (`src/lib/ai/assistant.ts`):
- 调用 `searchWithContext` 进行 RAG 检索
- 构建 RAG Prompt (上下文 + 用户问题)
- 调用 DeepSeek API 生成回答
- 保存对话历史到数据库

#### 任务 2.2: 添加 RPC 函数 ✅

**文件**: `supabase/migrations/014-fix-search-function.sql`

```sql
-- 向量匹配函数 search_documents
-- 向量维度: 1024 (Cohere embed-english-v3.0)
-- 支持按 symbol 过滤
```

---

### Phase 3: 前端集成 ✅ 已完成

#### 任务 3.1: 创建 AI 助手页面 ✅

**文件**: `src/app/assistant/page.tsx`

#### 任务 3.2: 在 Header 添加入口 ✅

**文件**: `src/components/layout/Header.tsx`

- 添加「AI 助手」导航项
- 链接到 `/assistant` 页面

#### 任务 3.3: ChatInterface 组件 ✅

**文件**: `src/components/investment/chat-interface.tsx`

- 已集成 RAG 功能
- 支持对话历史展示
- 支持消息发送和接收

---

## 五、文件变更清单

| 操作 | 文件路径 | 说明 | 状态 |
|------|---------|------|------|
| 新增 | `scripts/generate-embeddings.ts` | 向量生成脚本 | ✅ |
| 新增 | `supabase/migrations/014-fix-search-function.sql` | RPC 函数 | ✅ |
| 新增 | `src/lib/ai/rag.ts` | RAG 检索核心逻辑 | ✅ |
| 新增 | `src/lib/ai/embeddings.ts` | 向量生成 (Cohere) | ✅ |
| 新增 | `src/lib/ai/ingestion.ts` | 数据摄入逻辑 | ✅ |
| 修改 | `src/app/api/assistant/chat/route.ts` | 接入 RAG + 动态建议 | ✅ |
| 修改 | `src/lib/ai/assistant.ts` | getQuickActions 返回 query | ✅ |
| 新增 | `src/app/assistant/page.tsx` | AI 助手页面 | ✅ |
| 修改 | `src/components/layout/Header.tsx` | 添加导航入口 | ✅ |
| 修改 | `src/components/investment/chat-interface.tsx` | RAG 集成 + 动态建议 | ✅ |

---

## 六、验收标准

### 6.1 功能验收

| 测试场景 | 预期结果 | 状态 |
|----------|----------|------|
| 点击 Header「AI 助手」 | 进入 /assistant 页面 | ✅ |
| 提问「AAPL 最近财报如何」 | 返回基于真实数据的回答 | ✅ |
| 刷新页面后 | 对话历史保留 | ✅ |
| 搜索「营收增长」 | 返回相关财报内容 | ✅ |

### 6.2 性能验收

| 指标 | 目标 | 状态 |
|------|------|------|
| 首次响应时间 | < 3 秒 | ✅ |
| 向量检索时间 | < 500ms | ✅ |
| 对话历史加载 | < 1 秒 | ✅ |

---

## 七、后续迭代

### 7.1 V2 功能 ✅ 已完成 (2026-02-21)

| 功能 | 说明 | 状态 |
|------|------|------|
| 支持多轮对话上下文 | 保留最近6条消息作为上下文 | ✅ |
| 添加快捷问题建议 | 动态生成，基于 symbol | ✅ |
| 快捷操作按钮 | 投资评级、财务分析等 | ✅ |

**实现细节**:
- 后端: `GET /api/assistant/chat?action=suggestions&symbol=AAPL`
- 前端: 组件加载时自动获取建议
- 支持 symbol 上下文相关问题

### 7.2 V3 功能 (待开发)

- [ ] 支持语音输入
- [ ] 添加引用跳转 (点击跳转到原始财报)

### 7.2 知识库扩展

- [ ] 接入更多数据源 (研报、新闻)
- [ ] 支持 PDF 文档上传
- [ ] 用户自定义知识库

---

## 八、风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| 向量数据量少 | RAG 效果差 | 先用 AI 分析内容填充 |
| API 调用成本 | 费用超支 | 限制每日调用次数 |
| 响应速度慢 | 用户体验差 | 添加缓存层 |

---

## 九、相关文档

- 数据库表: `006-vector-embeddings.sql`
- 向量生成: `scripts/generate-embeddings.ts`
- RAG 核心: `src/lib/ai/rag.ts`
- 向量嵌入: `src/lib/ai/embeddings.ts`
- 现有 API: `src/app/api/assistant/chat/route.ts`
- 现有组件: `src/components/investment/chat-interface.tsx`

---

**文档状态**: ✅ 已完成  
**完成日期**: 2026-02-21  
**版本**: 1.0
