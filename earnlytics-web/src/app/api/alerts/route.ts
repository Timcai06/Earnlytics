import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";

function unauthorized() {
  return NextResponse.json({ error: "用户未登录" }, { status: 401 });
}

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

function serializePreferences(row: NotificationPreferencesRow | null, userId: string) {
  if (!row) return defaultPreferences(userId);
  return {
    userId: row.user_id,
    emailEnabled: row.email_enabled ?? true,
    pushEnabled: row.push_enabled ?? false,
    digestFrequency: row.digest_frequency ?? "immediate",
    alertTypes: row.alert_types || defaultPreferences(userId).alertTypes,
    quietHoursStart: row.quiet_hours_start || "",
    quietHoursEnd: row.quiet_hours_end || "",
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const resolvedSession = await resolveSessionFromRequest(request);
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }
    if (!resolvedSession.authUserId) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "rules";
    const authUserId = resolvedSession.authUserId;
    let response: NextResponse;

    if (type === "rules") {
      const { data: rules, error } = await supabase
        .from("alert_rules")
        .select("*")
        .eq("user_id", authUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      response = NextResponse.json({
        success: true,
        rules: ((rules || []) as AlertRuleRow[]).map(serializeRule),
      });
    } else if (type === "history") {
      const { data: history, error } = await supabase
        .from("alert_history")
        .select("*")
        .eq("user_id", authUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      response = NextResponse.json({
        success: true,
        history: ((history || []) as AlertHistoryRow[]).map(serializeHistory),
      });
    } else if (type === "preferences") {
      const { data: prefs, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", authUserId)
        .maybeSingle();

      if (error) throw error;

      response = NextResponse.json({
        success: true,
        preferences: serializePreferences((prefs as NotificationPreferencesRow | null) || null, authUserId),
      });
    } else if (type === "all") {
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

      if (rulesResult.error) throw rulesResult.error;
      if (historyResult.error) throw historyResult.error;
      if (preferencesResult.error) throw preferencesResult.error;

      response = NextResponse.json({
        success: true,
        rules: ((rulesResult.data || []) as AlertRuleRow[]).map(serializeRule),
        history: ((historyResult.data || []) as AlertHistoryRow[]).map(serializeHistory),
        preferences: serializePreferences(
          (preferencesResult.data as NotificationPreferencesRow | null) || null,
          authUserId
        ),
      });
    } else {
      response = NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }
    return response;
  } catch (error) {
    console.error("Get alerts error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get alerts", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const resolvedSession = await resolveSessionFromRequest(request);
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }
    if (!resolvedSession.authUserId) {
      return unauthorized();
    }

    const body = await request.json();
    const { symbol, ruleType, conditions, notificationChannels, name, description } = body;

    if (!ruleType) {
      return NextResponse.json({ error: "Rule type is required" }, { status: 400 });
    }

    const { data: rule, error } = await supabase
      .from("alert_rules")
      .insert({
        user_id: resolvedSession.authUserId,
        symbol,
        rule_type: ruleType,
        conditions: conditions || {},
        notification_channels: notificationChannels || ["email"],
        name,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    const response = NextResponse.json({ success: true, rule: serializeRule(rule as AlertRuleRow) });
    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }
    return response;
  } catch (error) {
    console.error("Create alert error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create alert", details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const resolvedSession = await resolveSessionFromRequest(request);
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }
    if (!resolvedSession.authUserId) {
      return unauthorized();
    }

    const body = await request.json();
    const { type, preferences, alertId, isRead, ruleId, isActive, ...updates } = body as {
      type?: string;
      preferences?: Record<string, unknown>;
      alertId?: string;
      isRead?: boolean;
      ruleId?: string;
      isActive?: boolean;
    };

    if (type === "preferences") {
      const prefs = preferences || {};
      const alertTypesRaw =
        typeof prefs.alertTypes === "object" && prefs.alertTypes
          ? (prefs.alertTypes as Record<string, boolean>)
          : defaultPreferences(resolvedSession.authUserId).alertTypes;

      const payload = {
        user_id: resolvedSession.authUserId,
        email_enabled: prefs.emailEnabled === undefined ? true : Boolean(prefs.emailEnabled),
        push_enabled: prefs.pushEnabled === undefined ? false : Boolean(prefs.pushEnabled),
        digest_frequency:
          prefs.digestFrequency === "daily" || prefs.digestFrequency === "weekly"
            ? prefs.digestFrequency
            : "immediate",
        alert_types: {
          rating_change: alertTypesRaw.rating_change ?? true,
          target_price: alertTypesRaw.target_price ?? true,
          valuation_anomaly: alertTypesRaw.valuation_anomaly ?? true,
          earnings_date: alertTypesRaw.earnings_date ?? true,
          price_threshold: alertTypesRaw.price_threshold ?? false,
        },
        quiet_hours_start:
          typeof prefs.quietHoursStart === "string" && prefs.quietHoursStart
            ? prefs.quietHoursStart
            : null,
        quiet_hours_end:
          typeof prefs.quietHoursEnd === "string" && prefs.quietHoursEnd
            ? prefs.quietHoursEnd
            : null,
        updated_at: new Date().toISOString(),
      };

      const { data: saved, error: prefsError } = await supabase
        .from("user_notification_preferences")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (prefsError) throw prefsError;

      const response = NextResponse.json({
        success: true,
        preferences: serializePreferences(saved as NotificationPreferencesRow, resolvedSession.authUserId),
      });
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session);
      }
      return response;
    }

    if (alertId) {
      const { data: updated, error: alertError } = await supabase
        .from("alert_history")
        .update({
          is_read: isRead === undefined ? true : Boolean(isRead),
          read_at: isRead === false ? null : new Date().toISOString(),
        })
        .eq("id", alertId)
        .eq("user_id", resolvedSession.authUserId)
        .select()
        .single();

      if (alertError) throw alertError;

      const response = NextResponse.json({ success: true, alert: serializeHistory(updated as AlertHistoryRow) });
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session);
      }
      return response;
    }

    if (!ruleId) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const safeUpdates = { ...updates } as Record<string, unknown>;
    delete safeUpdates.userId;
    delete safeUpdates.user_id;

    const rulePatch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (isActive !== undefined) {
      rulePatch.is_active = isActive;
    }
    if (safeUpdates.name !== undefined) {
      rulePatch.name = safeUpdates.name;
    }
    if (safeUpdates.description !== undefined) {
      rulePatch.description = safeUpdates.description;
    }
    if (safeUpdates.conditions !== undefined) {
      rulePatch.conditions = safeUpdates.conditions;
    }
    if (safeUpdates.notificationChannels !== undefined) {
      rulePatch.notification_channels = safeUpdates.notificationChannels;
    }

    const { data: rule, error } = await supabase
      .from("alert_rules")
      .update(rulePatch)
      .eq("id", ruleId)
      .eq("user_id", resolvedSession.authUserId)
      .select()
      .single();

    if (error) throw error;

    const response = NextResponse.json({ success: true, rule: serializeRule(rule as AlertRuleRow) });
    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }
    return response;
  } catch (error) {
    console.error("Update alert error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update alert", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const resolvedSession = await resolveSessionFromRequest(request);
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }
    if (!resolvedSession.authUserId) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("alert_rules")
      .delete()
      .eq("id", ruleId)
      .eq("user_id", resolvedSession.authUserId);

    if (error) throw error;

    const response = NextResponse.json({ success: true, message: "Alert rule deleted" });
    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }
    return response;
  } catch (error) {
    console.error("Delete alert error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete alert", details: message },
      { status: 500 }
    );
  }
}
