# API文档

> 第三方API集成规范、认证方法与错误处理

---

## API概览

| API | 用途 | 免费额度 | 稳定性 |
|-----|------|---------|--------|
| **FMP** | 财报数据 | 250次/天 | ⭐⭐⭐⭐ |
| **SEC EDGAR** | 官方文件 | 无限 | ⭐⭐⭐⭐⭐ |
| **DeepSeek** | AI分析 | 付费 | ⭐⭐⭐⭐ |
| **Resend** | 邮件 | 100封/天 | ⭐⭐⭐⭐⭐ |

---

## FMP API

### 认证
```typescript
const API_KEY = process.env.FMP_API_KEY
const url = `https://financialmodelingprep.com/api/v3/earning_calendar?apikey=${API_KEY}`
```

### 核心端点

**财报日历**
```typescript
GET /api/v3/earning_calendar?from=2026-01-01&to=2026-01-31
```

**财务报表**
```typescript
GET /api/v3/income-statement/{symbol}?period=quarter
```

**公司信息**
```typescript
GET /api/v3/profile/{symbol}
```

---

## DeepSeek API

### 认证
```typescript
headers: {
  'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
  'Content-Type': 'application/json'
}
```

### Chat Completions
```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}` },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: '你是财报分析师' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  })
})
```

### Prompt模板
```typescript
const prompt = `分析${companyName}财报：
营收: $${revenue}B
EPS: $${eps}

返回JSON格式：
{
  "summary": "100字摘要",
  "highlights": ["亮点1"],
  "concerns": ["风险1"],
  "sentiment": "positive"
}`
```

---

## SEC EDGAR API

### 认证
```typescript
headers: {
  'User-Agent': 'Earnlytics contact@earnlytics.com'
}
```

### 获取公司提交文件
```typescript
GET https://data.sec.gov/submissions/CIK{cik}.json
```

**注意**：每秒最多10次请求

---

## Resend API

### 发送邮件
```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'Earnlytics <hello@earnlytics.com>',
    to: 'user@example.com',
    subject: '财报提醒',
    html: '<p>内容</p>'
  })
})
```

---

## 错误处理

### 统一错误处理
```typescript
class APIError extends Error {
  constructor(message, statusCode, apiName) {
    super(message)
    this.statusCode = statusCode
    this.apiName = apiName
  }
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await sleep(Math.pow(2, i) * 1000)
    }
  }
}
```

---

## 成本估算

| API | 月调用 | 成本 |
|-----|--------|------|
| FMP | ~500 | ¥0 |
| DeepSeek | ~120 | ¥1-2 |
| Resend | ~500 | ¥0 |
| **总计** | | **¥1-2** |

---

详细部署见：部署运维.md
