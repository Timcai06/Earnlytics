# Plan 2 生产环境配置指南

## 1. Vercel 环境变量配置

### 步骤：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到 `earnlytics` 项目并点击进入
3. 点击顶部导航栏的 **Settings**
4. 左侧菜单选择 **Environment Variables**
5. 点击 **Add** 按钮，逐个添加以下变量：

### 必需的环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sdbdvtnhidifpdtyziwu.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYmR2dG5oaWRpZnBkdHl6aXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTMyNjksImV4cCI6MjA4NjAyOTI2OX0.qqwH4ObruEroG6NOIVk1b_yC_wpsaDGMl21We5dHT0M` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYmR2dG5oaWRpZnBkdHl6aXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MzI2OSwiZXhwIjoyMDg2MDI5MjY5fQ.zkhKf7AvS9YQAEcKETMXCGzqCa1fQnlQnqvHXDXync8` | Production |
| `FMP_API_KEY` | `KAsCR02pUvLLqfyLnt1llUq5vuq8vUuG` | Production |
| `DEEPSEEK_API_KEY` | `sk-eb9bd37f772141e2a55a5ace60a4ce66` | Production |

6. 添加完成后，点击 **Save**
7. 重新部署项目：进入 **Deployments** 标签，找到最新部署，点击 **Redeploy** 按钮

---

## 2. GitHub Secrets 配置

### 步骤：

1. 访问 GitHub 仓库：[https://github.com/Timcai06/Earnlytics](https://github.com/Timcai06/Earnlytics)
2. 点击顶部 **Settings** 标签
3. 左侧菜单展开 **Secrets and variables**，选择 **Actions**
4. 点击 **New repository secret** 按钮
5. 逐个添加以下 secrets：

### 必需的 Secrets：

| Secret 名称 | 值 |
|-------------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYmR2dG5oaWRpZnBkdHl6aXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MzI2OSwiZXhwIjoyMDg2MDI5MjY5fQ.zkhKf7AvS9YQAEcKETMXCGzqCa1fQnlQnqvHXDXync8` |
| `FMP_API_KEY` | `KAsCR02pUvLLqfyLnt1llUq5vuq8vUuG` |
| `DEEPSEEK_API_KEY` | `sk-eb9bd37f772141e2a55a5ace60a4ce66` |

---

## 3. 生产环境测试清单

配置完成后，请按以下顺序测试：

### ✅ 基础功能测试

1. **访问公司列表页**
   - URL: https://earnlytics-ebon.vercel.app/companies
   - 预期：显示 10 家公司卡片，带有行业呼吸灯效果

2. **筛选功能测试**
   - 点击顶部的行业筛选按钮（芯片、软件、电商等）
   - 预期：卡片根据行业正确筛选

3. **财报详情页测试**
   - 点击任意公司的「查看财报 →」按钮
   - 预期：跳转到 `/earnings/[symbol]` 页面，显示详细数据和 AI 分析

4. **健康检查 API**
   - URL: https://earnlytics-ebon.vercel.app/api/health
   - 预期：返回 JSON，显示数据库连接状态和测试数据

### ✅ 数据验证

确保以下数据已正确显示：
- 公司名称和股票代码
- 最新财报数据（营收、EPS、净利润等）
- AI 分析摘要、亮点、关注点
- 情感标签（积极/中性/消极）

---

## 4. 故障排查

如果测试失败，请检查：

### 404 错误
1. 检查 Vercel 环境变量是否正确配置
2. 访问 `/api/health` 检查数据库连接
3. 查看 Vercel 部署日志：Settings → Git → Latest Deployment → View Logs

### 数据不显示
1. 确认 Supabase 数据库中有数据
2. 检查 Supabase 表权限设置
3. 验证 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确

### 自动化脚本不运行
1. 确认 GitHub Secrets 已正确配置
2. 检查 GitHub Actions 是否启用：仓库 Settings → Actions → General → Allow all actions
3. 手动触发工作流测试：Actions → Update Earnings Data → Run workflow

---

## 5. 下一步（可选）

### 配置 Vercel Deploy Hook（用于自动重新部署）

1. Vercel Dashboard → 项目 Settings → Git
2. 找到 **Deploy Hooks** 部分
3. 点击 **Create Hook**
4. 命名：`Production Redeploy`
5. 分支：`main`
6. 复制生成的 webhook URL
7. 添加到 GitHub Secrets：`VERCEL_DEPLOY_HOOK`

这样当 GitHub Actions 更新数据后，可以自动触发 Vercel 重新部署。

---

**完成以上配置后，Plan 2 就完全部署好了！**
