# 自动化任务（GitHub Actions）

## 任务文件

1. `.github/workflows/update.yml`
2. `.github/workflows/sync-investment-data.yml`
3. `earnlytics-web/.github/workflows/process-alerts.yml`

## 作用

1. 定时抓财报并做 AI 分析
2. 定时同步估值、行业基准
3. 定时处理告警并发送邮件

## 你要理解的关键点

1. 工作流是“线上定时脚本”
2. 运行依赖 GitHub Secrets（密钥）
3. 本地代码不变，线上数据也可能持续变化

## 常见排查点

1. workflow 失败：先看日志中哪一步失败
2. API key 过期：检查 Secrets
3. 数据未更新：检查 cron 与脚本日志

