import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";
import {
  computeNoteAlignment,
  extractNoteTags,
  fetchAIAnalysisContext,
  resolveEarningSymbol,
  upsertNoteEmbedding,
} from "@/lib/notes/service";

interface NoteRow {
  id: number;
  user_id: number;
  earning_id: number;
  symbol: string;
  content: string;
  tags: string[];
  latest_version: number;
  created_at: string;
  updated_at: string;
}

interface NoteVersionRow {
  id: number;
  note_id: number;
  version: number;
  content: string;
  tags: string[];
  ai_alignment_score: number | null;
  ai_alignment_summary: string | null;
  created_at: string;
}

function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeContent(content: unknown): string {
  if (typeof content !== "string") return "";
  return content.trim();
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const earningId = parsePositiveInt(searchParams.get("earning_id"));
    const resolvedSession = await resolveSessionFromRequest(request);

    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }

    if (!resolvedSession.appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!earningId) {
      return NextResponse.json(
        { error: "earning_id is required" },
        { status: 400 }
      );
    }

    const { data: noteData, error: noteError } = await supabase
      .from("user_notes")
      .select("*")
      .eq("user_id", resolvedSession.appUser.id)
      .eq("earning_id", earningId)
      .maybeSingle();

    if (noteError) {
      console.error("GET /api/notes noteError:", noteError);
      return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
    }

    if (!noteData) {
      return NextResponse.json({ note: null, versions: [] });
    }

    const note = noteData as NoteRow;
    const { data: versionsData, error: versionsError } = await supabase
      .from("user_note_versions")
      .select("*")
      .eq("note_id", note.id)
      .order("version", { ascending: false })
      .limit(20);

    if (versionsError) {
      console.error("GET /api/notes versionsError:", versionsError);
      return NextResponse.json({ error: "Failed to fetch note versions" }, { status: 500 });
    }

    const response = NextResponse.json({
      note,
      versions: (versionsData || []) as NoteVersionRow[],
    });

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }

    return response;
  } catch (error) {
    console.error("GET /api/notes unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const earningId = parsePositiveInt(body?.earning_id ? String(body.earning_id) : null);
    const content = normalizeContent(body?.content);
    const resolvedSession = await resolveSessionFromRequest(request);

    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }

    if (!resolvedSession.appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!earningId) {
      return NextResponse.json(
        { error: "earning_id is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    if (content.length > 12000) {
      return NextResponse.json({ error: "笔记内容不能超过12000字符" }, { status: 400 });
    }

    const symbol = await resolveEarningSymbol(supabase, earningId);
    if (!symbol) {
      return NextResponse.json({ error: "Earning not found" }, { status: 404 });
    }

    const [tags, aiContext] = await Promise.all([
      extractNoteTags(content),
      fetchAIAnalysisContext(supabase, earningId),
    ]);

    const alignment = await computeNoteAlignment(content, aiContext);

    const { data: existingData, error: existingError } = await supabase
      .from("user_notes")
      .select("*")
      .eq("user_id", resolvedSession.appUser.id)
      .eq("earning_id", earningId)
      .maybeSingle();

    if (existingError) {
      console.error("POST /api/notes existingError:", existingError);
      return NextResponse.json({ error: "Failed to query existing note" }, { status: 500 });
    }

    let note: NoteRow;
    let currentVersion = 1;

    if (existingData) {
      const existing = existingData as NoteRow;
      currentVersion = existing.latest_version + 1;

      const { data: updatedData, error: updateError } = await supabase
        .from("user_notes")
        .update({
          content,
          tags,
          latest_version: currentVersion,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError || !updatedData) {
        console.error("POST /api/notes updateError:", updateError);
        return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
      }

      note = updatedData as NoteRow;
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from("user_notes")
        .insert({
          user_id: resolvedSession.appUser.id,
          earning_id: earningId,
          symbol: symbol.toUpperCase(),
          content,
          tags,
          latest_version: 1,
        })
        .select("*")
        .single();

      if (insertError || !insertedData) {
        console.error("POST /api/notes insertError:", insertError);
        return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
      }

      note = insertedData as NoteRow;
      currentVersion = 1;
    }

    const { error: versionError } = await supabase.from("user_note_versions").insert({
      note_id: note.id,
      version: currentVersion,
      content,
      tags,
      ai_alignment_score: alignment.score,
      ai_alignment_summary: alignment.summary,
    });

    if (versionError) {
      console.error("POST /api/notes versionError:", versionError);
      return NextResponse.json({ error: "Failed to save note version" }, { status: 500 });
    }

    await upsertNoteEmbedding(supabase, note.id, content);

    const { data: versionsData, error: versionsError } = await supabase
      .from("user_note_versions")
      .select("*")
      .eq("note_id", note.id)
      .order("version", { ascending: false })
      .limit(20);

    if (versionsError) {
      console.error("POST /api/notes versionsError:", versionsError);
      return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      note,
      currentVersion,
      versions: (versionsData || []) as NoteVersionRow[],
    });

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }

    return response;
  } catch (error) {
    console.error("POST /api/notes unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
