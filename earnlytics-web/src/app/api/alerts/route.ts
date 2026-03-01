import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";

function unauthorized() {
  return NextResponse.json({ error: "用户未登录" }, { status: 401 });
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
      response = NextResponse.json({ success: true, rules: rules || [] });
    } else if (type === "history") {
      const { data: history, error } = await supabase
        .from("alert_history")
        .select("*")
        .eq("user_id", authUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      response = NextResponse.json({ success: true, history: history || [] });
    } else if (type === "preferences") {
      const { data: prefs, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", authUserId)
        .maybeSingle();

      if (error) throw error;

      response = NextResponse.json({
        success: true,
        preferences: prefs || {
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
        },
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

    const response = NextResponse.json({ success: true, rule });
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
    const { ruleId, isActive, ...updates } = body;

    if (!ruleId) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const safeUpdates = { ...updates } as Record<string, unknown>;
    delete safeUpdates.userId;
    delete safeUpdates.user_id;

    const { data: rule, error } = await supabase
      .from("alert_rules")
      .update({
        is_active: isActive,
        ...safeUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ruleId)
      .eq("user_id", resolvedSession.authUserId)
      .select()
      .single();

    if (error) throw error;

    const response = NextResponse.json({ success: true, rule });
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
