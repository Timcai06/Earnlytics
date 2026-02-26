'use client'

import * as React from 'react'
import { Mail, Smartphone, Bell, Clock, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UserNotificationPreferences } from '@/types/investment'

interface NotificationPreferencesProps {
  preferences: UserNotificationPreferences
  onSave: (preferences: Partial<UserNotificationPreferences>) => void
  className?: string
}

export function NotificationPreferences({
  preferences,
  onSave,
  className,
}: NotificationPreferencesProps) {
  const [localPrefs, setLocalPrefs] = React.useState(preferences)
  const [hasChanges, setHasChanges] = React.useState(false)

  const handleToggle = (key: keyof UserNotificationPreferences, value: boolean | string) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleAlertTypeToggle = (type: string, value: boolean) => {
    setLocalPrefs(prev => ({
      ...prev,
      alertTypes: {
        ...prev.alertTypes,
        [type]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(localPrefs)
    setHasChanges(false)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold">通知偏好</h2>
        <p className="text-muted-foreground">自定义您的预警通知方式</p>
      </div>

      {/* Channel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            通知渠道
          </CardTitle>
          <CardDescription>选择您希望接收通知的方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email" className="font-medium">邮件通知</Label>
                <p className="text-sm text-muted-foreground">通过邮件接收预警</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={localPrefs.emailEnabled}
              onCheckedChange={checked => handleToggle('emailEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push" className="font-medium">推送通知</Label>
                <p className="text-sm text-muted-foreground">浏览器推送通知（即将推出）</p>
              </div>
            </div>
            <Switch
              id="push"
              checked={localPrefs.pushEnabled}
              onCheckedChange={checked => handleToggle('pushEnabled', checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            汇总设置
          </CardTitle>
          <CardDescription>选择预警通知的发送频率</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'immediate', label: '实时发送', desc: '预警触发立即通知' },
              { value: 'daily', label: '每日汇总', desc: '每天发送一次汇总' },
              { value: 'weekly', label: '每周汇总', desc: '每周发送一次汇总' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleToggle('digestFrequency', option.value)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  localPrefs.digestFrequency === option.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                )}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle>预警类型</CardTitle>
          <CardDescription>选择您希望接收的预警类型</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'rating_change', label: '评级变化', desc: '分析师评级上调或下调' },
            { key: 'target_price', label: '目标价调整', desc: '目标价大幅变化（>10%）' },
            { key: 'valuation_anomaly', desc: '估值突破历史区间' },
            { key: 'earnings_date', label: '财报提醒', desc: '财报发布前提醒' },
            { key: 'price_threshold', label: '价格阈值', desc: '股价达到设定值' },
          ].map(type => (
            <div key={type.key} className="flex items-center justify-between">
              <div>
                <Label className="font-medium">{type.label}</Label>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
              </div>
              <Switch
                checked={localPrefs.alertTypes?.[type.key as keyof typeof localPrefs.alertTypes] ?? true}
                onCheckedChange={checked => handleAlertTypeToggle(type.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            免打扰时段
          </CardTitle>
          <CardDescription>设置在特定时间段内不接收通知</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm">开始时间</Label>
              <input
                type="time"
                value={localPrefs.quietHoursStart || ''}
                onChange={e => handleToggle('quietHoursStart', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
            <div className="text-muted-foreground pt-6">至</div>
            <div className="flex-1">
              <Label className="text-sm">结束时间</Label>
              <input
                type="time"
                value={localPrefs.quietHoursEnd || ''}
                onChange={e => handleToggle('quietHoursEnd', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存更改</Button>
        </div>
      )}
    </div>
  )
}
