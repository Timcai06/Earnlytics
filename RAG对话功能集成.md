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
| `/api/assistant/chat` | ✅ 基础版存在 | 简单对话，无 RAG |
| `ChatInterface` 组件 | ✅ 已创建 | 前端对话 UI |
| `pgvector` 扩展 | ✅ 已安装 | 向量相似度搜索 |

### 1.2 当前问题

1. **向量数据为空** - `document_embeddings` 表无数据
2. **RAG 未实现** - 对话 API 未接入向量检索
3. **前端无入口** - 用户无法访问 AI 助手
4. **对话历史未存储** - 每次对话是全新会话

---

## 二、目标功能

### 2.1 核心功能

- [ ] 用户可通过导航栏进入 AI 对话助手
- [ ] AI 可以基于已分析的财报数据回答问题
- [ ] 支持对话历史，用户可回顾之前的对话
- [ ] 支持语义搜索，找到相关的财报内容

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

### Phase 1: 数据准备

#### 任务 1.1: 创建向量生成脚本

**文件**: `scripts/generate-embeddings.ts`

**功能**:
- 扫描 `ai_analyses` 表中的分析内容
- 扫描 `earnings` 表中的财报数据
- 使用 DeepSeek text-embedding-3-small 生成向量
- 批量存入 `document_embeddings` 表

**实现逻辑**:
```typescript
// 伪代码
const analyses = await getAiAnalyses()
for (const analysis of analyses) {
  const content = `${analysis.summary}\n${analysis.highlights.join('\n')}`
  const embedding = await getEmbedding(content)
  await saveEmbedding({
    source_type: 'analysis',
    source_id: analysis.id,
    content_chunk: content,
    embedding: embedding
  })
}
```

#### 任务 1.2: 验证向量检索

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

### Phase 2: RAG 核心实现

#### 任务 2.1: 增强 `/api/assistant/chat` API

**文件**: `src/app/api/assistant/chat/route.ts`

**修改内容**:

1. **向量检索函数**
   ```typescript
   async function searchRelevantContent(query: string) {
     const queryEmbedding = await getEmbedding(query)
     
     const { data } = await supabase.rpc('match_documents', {
       query_embedding: queryEmbedding,
       match_threshold: 0.7,
       match_count: 5
     })
     return data
   }
   ```

2. **RAG Prompt 构建**
   ```typescript
   const context = relevantDocs.map(d => d.content_chunk).join('\n\n')
   const prompt = `
     你是一个专业的投资分析师助手。
     基于以下参考内容回答用户问题。
     
     参考内容：
     ${context}
     
     用户问题：${userMessage}
     
     回答要求：
     1. 基于参考内容回答
     2. 如参考内容不足以回答，请明确说明
     3. 保持专业、简洁
   `
   ```

3. **对话历史存储**
   ```typescript
   // 保存用户消息
   await supabase.from('chat_messages').insert({
     conversation_id: conversationId,
     role: 'user',
     content: userMessage
   })
   
   // 保存 AI 回复
   await supabase.from('chat_messages').insert({
     conversation_id: conversationId,
     role: 'assistant',
     content: aiResponse
   })
   ```

#### 任务 2.2: 添加 RPC 函数 (数据库)

**文件**: 新增 migration 或直接在 Supabase SQL Editor 执行

```sql
-- 创建向量匹配函数
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content_chunk TEXT,
  source_type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.content_chunk,
    de.source_type,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

### Phase 3: 前端集成

#### 任务 3.1: 创建 AI 助手页面

**文件**: `src/app/assistant/page.tsx`

**结构**:
```tsx
import { ChatInterface } from "@/components/investment/chat-interface"

export default function AssistantPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">AI 投资助手</h1>
      <ChatInterface />
    </div>
  )
}
```

#### 任务 3.2: 在 Header 添加入口

**文件**: `src/components/layout/Header.tsx`

**修改**:
- 添加「AI 助手」导航项
- 添加图标 (Sparkles 或 MessageCircle)

```tsx
<Link href="/assistant" className="...">
  <Sparkles className="h-4 w-4" />
  AI 助手
</Link>
```

#### 任务 3.3: 优化 ChatInterface 组件

**文件**: `src/components/investment/chat-interface.tsx`

**增强功能**:
- 添加加载状态动画
- 添加引用来源展示
- 支持代码块渲染
- 添加快捷问题按钮

---

## 五、文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新增 | `scripts/generate-embeddings.ts` | 向量生成脚本 |
| 新增 | `supabase/migrations/013-rag-functions.sql` | RPC 函数 |
| 修改 | `src/app/api/assistant/chat/route.ts` | 接入 RAG |
| 新增 | `src/app/assistant/page.tsx` | AI 助手页面 |
| 修改 | `src/components/layout/Header.tsx` | 添加导航入口 |
| 修改 | `src/components/investment/chat-interface.tsx` | 优化 UI |

---

## 六、验收标准

### 6.1 功能验收

| 测试场景 | 预期结果 |
|----------|----------|
| 点击 Header「AI 助手」 | 进入 /assistant 页面 |
| 提问「AAPL 最近财报如何」 | 返回基于真实数据的回答 |
| 刷新页面后 | 对话历史保留 |
| 搜索「营收增长」 | 返回相关财报内容 |

### 6.2 性能验收

| 指标 | 目标 |
|------|------|
| 首次响应时间 | < 3 秒 |
| 向量检索时间 | < 500ms |
| 对话历史加载 | < 1 秒 |

---

## 七、后续迭代

### 7.1 V2 功能 (可选)

- [ ] 支持多轮对话上下文
- [ ] 添加快捷问题建议
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
- 现有 API: `src/app/api/assistant/chat/route.ts`
- 现有组件: `src/components/investment/chat-interface.tsx`

---

**文档状态**: 规划阶段  
**待办**: 等待实施
