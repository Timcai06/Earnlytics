"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Loader2, X } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { redirectToLoginOnce } from "@/lib/auth/guard";
import { AlertManagementPanel, NotificationPreferences, QuickAlertForm } from "@/components/investment";
import { UserNotificationPreferences } from "@/types/investment";

type RuleType = "rating_change" | "target_price" | "valuation_anomaly" | "earnings_date" | "price_threshold";

interface AlertRuleView {
  id: string;
  userId: string;
  symbol?: string;
  ruleType: RuleType;
  conditions: Record<string, unknown>;
  notificationChannels: ("email" | "push")[];
  name?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastTriggeredAt?: string;
  triggerCount?: number;
}

interface AlertHistoryView {
  id: string;
  ruleId: string;
  userId: string;
  symbol: string;
  alertType: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  priority: "high" | "medium" | "low";
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

interface AlertsPageInitialData {
  rules: AlertRuleView[];
  history: AlertHistoryView[];
  preferences: UserNotificationPreferences;
}

const defaultPreferences: UserNotificationPreferences = {
  userId: "",
  emailEnabled: true,
  pushEnabled: false,
  digestFrequency: "immediate",
  alertTypes: {
    rating_change: true,
    target_price: true,
    valuation_anomaly: true,
    earnings_date: true,
    price_threshold: false,
  },
  quietHoursStart: "",
  quietHoursEnd: "",
  updatedAt: "",
};

interface AlertsPageClientProps {
  initialData?: AlertsPageInitialData | null;
}

export default function AlertsPageClient({ initialData = null }: AlertsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthUser();
  const userId = user?.id ?? null;
  const hasInitialData = initialData !== null;
  const [loading, setLoading] = useState(() => !hasInitialData);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<AlertRuleView[]>(() => initialData?.rules || []);
  const [history, setHistory] = useState<AlertHistoryView[]>(() => initialData?.history || []);
  const [preferences, setPreferences] = useState<UserNotificationPreferences>(() => initialData?.preferences || defaultPreferences);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const preferredSymbol = useMemo(() => {
    const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();
    return symbol || undefined;
  }, [searchParams]);

  const redirectToLogin = useCallback(() => {
    redirectToLoginOnce(router, "/alerts");
  }, [router]);

  const fetchAll = useCallback(async (options?: { silent?: boolean }) => {
    if (!userId) return;
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch("/api/alerts?type=all");
      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || "加载预警数据失败");

      setRules((json.rules || []) as AlertRuleView[]);
      setHistory((json.history || []) as AlertHistoryView[]);
      setPreferences({
        ...defaultPreferences,
        ...(json.preferences || {}),
      });
    } catch (err) {
      console.error("alerts fetch error:", err);
      setError(err instanceof Error ? err.message : "加载失败，请稍后重试");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [redirectToLogin, userId]);

  useEffect(() => {
    if (!authLoading && !userId) {
      redirectToLogin();
    }
  }, [authLoading, redirectToLogin, userId]);

  useEffect(() => {
    if (userId) {
      if (hasInitialData) {
        const timer = setTimeout(() => {
          void fetchAll({ silent: true });
        }, 1500);
        return () => clearTimeout(timer);
      }
      void fetchAll();
    }
  }, [fetchAll, hasInitialData, userId]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const handleCreateRule = async (data: {
    ruleType: string;
    symbol?: string;
    conditions: Record<string, unknown>;
    notificationChannels: string[];
  }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        redirectToLogin();
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "创建预警失败");
      }

      if (json.rule) {
        setRules((prev) => [json.rule as AlertRuleView, ...prev]);
      }
      setCreateOpen(false);
    } catch (err) {
      console.error("create alert rule error:", err);
      setError(err instanceof Error ? err.message : "创建预警失败");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, isActive }),
      });
      if (res.status === 401) {
        redirectToLogin();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "更新规则失败");

      setRules((prev) =>
        prev.map((rule) => (rule.id === ruleId ? { ...rule, isActive } : rule))
      );
    } catch (err) {
      console.error("toggle rule error:", err);
      setError(err instanceof Error ? err.message : "更新规则失败");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/alerts?ruleId=${encodeURIComponent(ruleId)}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        redirectToLogin();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "删除规则失败");
      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    } catch (err) {
      console.error("delete rule error:", err);
      setError(err instanceof Error ? err.message : "删除规则失败");
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, isRead: true }),
      });
      if (res.status === 401) {
        redirectToLogin();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "标记已读失败");
      setHistory((prev) =>
        prev.map((entry) => (entry.id === alertId ? { ...entry, isRead: true } : entry))
      );
    } catch (err) {
      console.error("mark read error:", err);
      setError(err instanceof Error ? err.message : "标记已读失败");
    }
  };

  const handleSavePreferences = async (next: Partial<UserNotificationPreferences>) => {
    setSaving(true);
    setError(null);
    const merged = { ...preferences, ...next };
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "preferences",
          preferences: merged,
        }),
      });
      if (res.status === 401) {
        redirectToLogin();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "保存偏好失败");
      setPreferences({
        ...defaultPreferences,
        ...(json.preferences || {}),
      });
    } catch (err) {
      console.error("save preferences error:", err);
      setError(err instanceof Error ? err.message : "保存偏好失败");
    } finally {
      setSaving(false);
    }
  };

  if ((authLoading && !hasInitialData) || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId && !hasInitialData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-4 text-3xl font-bold text-white">预警中心</h1>
        <p className="mb-6 text-text-secondary">登录后可管理你的预警规则与通知偏好。</p>
        <Link
          href="/login?next=/alerts"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">预警中心</h1>
          <p className="mt-1 text-sm text-text-secondary">
            管理财报、评级与估值提醒，提升回访决策效率。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Bell className="h-4 w-4" />
          新建预警
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {saving ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
          保存中...
        </div>
      ) : null}

      <AlertManagementPanel
        rules={rules}
        history={history}
        onCreateRule={() => setCreateOpen(true)}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
        onMarkAsRead={handleMarkAsRead}
      />

      <NotificationPreferences
        preferences={preferences}
        onSave={handleSavePreferences}
      />

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="关闭创建预警弹窗"
            onClick={() => setCreateOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">创建新预警</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-md p-1 text-text-secondary hover:bg-surface-secondary hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <QuickAlertForm
              symbol={preferredSymbol}
              onSubmit={handleCreateRule}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
