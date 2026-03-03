import type { Metadata } from "next";
import AlertsPageClient from "./AlertsPageClient";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { resolveSessionFromCookieHeader } from "@/lib/auth/session";
import type { UserNotificationPreferences } from "@/types/investment";

export const metadata: Metadata = {
  title: "预警中心 - Earnlytics",
  description: "管理财报与估值预警规则、查看预警历史并配置通知偏好。",
  robots: {
    index: false,
    follow: false,
  },
};

type AlertRuleRow = {
  id: string;
  user_id: string;
  symbol: string | null;
  rule_type: "rating_change" | "target_price" | "valuation_anomaly" | "earnings_date" | "price_threshold";
  conditions: Record<string, unknown> | null;
  notification_channels: ("email" | "push")[] | null;
  is_active: boolean | null;
  name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  last_triggered_at: string | null;
  trigger_count: number | null;
};

type AlertHistoryRow = {
  id: string;
  rule_id: string | null;
  user_id: string;
  symbol: string | null;
  alert_type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  priority: "low" | "medium" | "high" | null;
  is_read: boolean | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
};

type NotificationPreferencesRow = {
  user_id: string;
  email_enabled: boolean | null;
  push_enabled: boolean | null;
  digest_frequency: "immediate" | "daily" | "weekly" | null;
  alert_types: Record<string, boolean> | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  updated_at: string | null;
};

interface AlertsPageInitialData {
  rules: ReturnType<typeof serializeRule>[];
  history: ReturnType<typeof serializeHistory>[];
  preferences: UserNotificationPreferences;
}

function buildCookieHeader() {
  return cookies()
    .then((store) => store.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; "))
    .catch(() => "");
}

function defaultPreferences(userId: string) {
  return {
    userId,
    emailEnabled: true,
    pushEnabled: false,
    digestFrequency: "immediate" as const,
    alertTypes: {
      rating_change: true,
      target_price: true,
      valuation_anomaly: true,
      earnings_date: true,
      price_threshold: false,
    },
    quietHoursStart: "",
    quietHoursEnd: "",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeAlertTypes(input: Record<string, boolean> | null | undefined) {
  return {
    rating_change: input?.rating_change ?? true,
    target_price: input?.target_price ?? true,
    valuation_anomaly: input?.valuation_anomaly ?? true,
    earnings_date: input?.earnings_date ?? true,
    price_threshold: input?.price_threshold ?? false,
  };
}

function serializeRule(row: AlertRuleRow) {
  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol || undefined,
    ruleType: row.rule_type,
    conditions: row.conditions || {},
    notificationChannels: row.notification_channels || ["email"],
    isActive: row.is_active ?? true,
    name: row.name || undefined,
    description: row.description || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
    lastTriggeredAt: row.last_triggered_at || undefined,
    triggerCount: row.trigger_count ?? 0,
  };
}

function serializeHistory(row: AlertHistoryRow) {
  return {
    id: row.id,
    ruleId: row.rule_id || "",
    userId: row.user_id,
    symbol: row.symbol || "",
    alertType: row.alert_type,
    title: row.title,
    message: row.message,
    data: row.data || {},
    priority: row.priority || "medium",
    isRead: row.is_read ?? false,
    sentAt: row.sent_at || row.created_at,
    readAt: row.read_at || undefined,
  };
}

function serializePreferences(row: NotificationPreferencesRow | null, userId: string) {
  if (!row) return defaultPreferences(userId);
  return {
    userId: row.user_id,
    emailEnabled: row.email_enabled ?? true,
    pushEnabled: row.push_enabled ?? false,
    digestFrequency: row.digest_frequency ?? "immediate",
    alertTypes: normalizeAlertTypes(row.alert_types),
    quietHoursStart: row.quiet_hours_start || "",
    quietHoursEnd: row.quiet_hours_end || "",
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export default async function AlertsPage() {
  const cookieHeader = await buildCookieHeader();
  const resolved = await resolveSessionFromCookieHeader(cookieHeader || null);
  const supabase = getSupabaseAdmin();
  let initialData: AlertsPageInitialData | null = null;

  if (supabase && !resolved.error && resolved.authUserId) {
    const authUserId = resolved.authUserId;
    try {
      const [rulesResult, historyResult, preferencesResult] = await Promise.all([
        supabase
          .from("alert_rules")
          .select("*")
          .eq("user_id", authUserId)
          .order("created_at", { ascending: false }),
        supabase
          .from("alert_history")
          .select("*")
          .eq("user_id", authUserId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("user_notification_preferences")
          .select("*")
          .eq("user_id", authUserId)
          .maybeSingle(),
      ]);

      if (!rulesResult.error && !historyResult.error && !preferencesResult.error) {
        initialData = {
          rules: ((rulesResult.data || []) as AlertRuleRow[]).map(serializeRule),
          history: ((historyResult.data || []) as AlertHistoryRow[]).map(serializeHistory),
          preferences: serializePreferences(
            (preferencesResult.data as NotificationPreferencesRow | null) || null,
            authUserId
          ),
        };
      }
    } catch {
      initialData = null;
    }
  }

  return <AlertsPageClient initialData={initialData} />;
}
