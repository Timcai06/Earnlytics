'use client'

import * as React from 'react'
import { Bell, BellOff, Trash2, Plus, Settings, Mail, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AlertRule, AlertHistory } from '@/types/investment'

interface AlertManagementPanelProps {
  rules: AlertRule[]
  history: AlertHistory[]
  onCreateRule: () => void
  onToggleRule: (ruleId: string, isActive: boolean) => void
  onDeleteRule: (ruleId: string) => void
  onMarkAsRead: (alertId: string) => void
  className?: string
}

const ruleTypeLabels: Record<string, string> = {
  rating_change: '评级变化',
  target_price: '目标价调整',
  valuation_anomaly: '估值异常',
  earnings_date: '财报提醒',
  price_threshold: '价格阈值',
}

const ruleTypeDescriptions: Record<string, string> = {
  rating_change: '当分析师评级发生变化时通知',
  target_price: '当目标价调整超过10%时通知',
  valuation_anomaly: '当估值突破历史区间时通知',
  earnings_date: '财报发布前3天提醒',
  price_threshold: '当价格达到设定阈值时通知',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
}

export function AlertManagementPanel({
  rules,
  history,
  onCreateRule,
  onToggleRule,
  onDeleteRule,
  onMarkAsRead,
  className,
}: AlertManagementPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'rules' | 'history'>('rules')
  const unreadCount = history.filter(h => !h.isRead).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">预警管理</h2>
          <p className="text-muted-foreground">管理您的投资预警和通知</p>
        </div>
        <Button onClick={onCreateRule}>
          <Plus className="w-4 h-4 mr-2" />
          新建预警
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">活跃预警</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">今日预警</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.filter(h => {
                const today = new Date().toDateString()
                const alertDate = new Date(h.sentAt).toDateString()
                return today === alertDate
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">未读预警</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={cn(
              'pb-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'rules'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            预警规则
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            预警历史
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'rules' ? (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">暂无预警规则</h3>
              <p className="text-sm text-muted-foreground mb-4">
                创建预警规则，及时获取投资提醒
              </p>
              <Button onClick={onCreateRule}>
                <Plus className="w-4 h-4 mr-2" />
                创建第一个预警
              </Button>
            </Card>
          ) : (
            rules.map(rule => (
              <Card key={rule.id} className={cn(!rule.isActive && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {rule.name || ruleTypeLabels[rule.ruleType]}
                        </h4>
                        {rule.symbol && (
                          <Badge variant="secondary">{rule.symbol}</Badge>
                        )}
                        {!rule.symbol && (
                          <Badge variant="outline">全市场</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || ruleTypeDescriptions[rule.ruleType]}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          邮件通知
                        </span>
                          {rule.triggerCount && rule.triggerCount > 0 && (
                          <span>已触发 {rule.triggerCount} 次</span>
                        )}
                        {rule.lastTriggeredAt && (
                          <span>
                            上次触发: {new Date(rule.lastTriggeredAt).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={checked => onToggleRule(rule.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card className="p-8 text-center">
              <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">暂无预警历史</h3>
              <p className="text-sm text-muted-foreground">
                预警触发后会显示在这里
              </p>
            </Card>
          ) : (
            history.map(alert => (
              <Card
                key={alert.id}
                className={cn(!alert.isRead && 'border-primary')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn('font-medium', !alert.isRead && 'text-primary')}>
                          {alert.title}
                        </h4>
                        <Badge className={priorityColors[alert.priority || 'medium']}>
                          {alert.priority === 'high' ? '高' : alert.priority === 'low' ? '低' : '中'}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="default" className="text-xs">未读</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.symbol && (
                          <Badge variant="secondary">{alert.symbol}</Badge>
                        )}
                        <span>
                          {new Date(alert.sentAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(alert.id)}
                      >
                        标记已读
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Quick alert creation form
 */
export function QuickAlertForm({
  symbol,
  onSubmit,
  onCancel,
}: {
  symbol?: string
  onSubmit: (data: {
    ruleType: string
    symbol?: string
    conditions: Record<string, unknown>
    notificationChannels: string[]
  }) => void
  onCancel: () => void
}) {
  const [ruleType, setRuleType] = React.useState('rating_change')
  const [selectedSymbol, setSelectedSymbol] = React.useState(symbol || '')
  const [emailEnabled, setEmailEnabled] = React.useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ruleType,
      symbol: selectedSymbol || undefined,
      conditions: {},
      notificationChannels: emailEnabled ? ['email'] : [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">预警类型</label>
        <select
          value={ruleType}
          onChange={e => setRuleType(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md"
        >
          <option value="rating_change">评级变化提醒</option>
          <option value="target_price">目标价大幅调整</option>
          <option value="valuation_anomaly">估值异常提醒</option>
          <option value="earnings_date">财报发布提醒</option>
          <option value="price_threshold">价格阈值提醒</option>
        </select>
      </div>

      {!symbol && (
        <div>
          <label className="text-sm font-medium">股票代码</label>
          <input
            type="text"
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value.toUpperCase())}
            placeholder="如: AAPL"
            className="w-full mt-1 p-2 border rounded-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            留空则表示关注全市场
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="email"
          checked={emailEnabled}
          onChange={e => setEmailEnabled(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="email" className="text-sm flex items-center gap-1">
          <Mail className="w-4 h-4" />
          邮件通知
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">创建预警</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  )
}
