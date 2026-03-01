import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";
import {
  computeNoteAlignment,
  fetchAIAnalysisContext,
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

interface VersionRow {
  version: number;
  content: string;
  tags: string[];
}

function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { noteId } = await params;
    const noteIdNum = parsePositiveInt(noteId);
    const body = await request.json();
    const targetVersion = parsePositiveInt(body?.version ? String(body.version) : null);
    const resolvedSession = await resolveSessionFromRequest(request);

    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }

    if (!resolvedSession.appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!noteIdNum || !targetVersion) {
      return NextResponse.json({ error: "noteId and version are required" }, { status: 400 });
    }

    const { data: noteData, error: noteError } = await supabase
      .from("user_notes")
      .select("*")
      .eq("id", noteIdNum)
      .eq("user_id", resolvedSession.appUser.id)
      .maybeSingle();

    if (noteError) {
      console.error("POST /api/notes/[noteId]/restore noteError:", noteError);
      return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
    }

    if (!noteData) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = noteData as NoteRow;
    const { data: versionData, error: versionError } = await supabase
      .from("user_note_versions")
      .select("version, content, tags")
      .eq("note_id", noteIdNum)
      .eq("version", targetVersion)
      .maybeSingle();

    if (versionError) {
      console.error("POST /api/notes/[noteId]/restore versionError:", versionError);
      return NextResponse.json({ error: "Failed to fetch note version" }, { status: 500 });
    }

    if (!versionData) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const sourceVersion = versionData as VersionRow;
    const newVersion = note.latest_version + 1;

    const aiContext = await fetchAIAnalysisContext(supabase, note.earning_id);
    const alignment = await computeNoteAlignment(sourceVersion.content, aiContext);

    const { data: updatedNoteData, error: updateError } = await supabase
      .from("user_notes")
      .update({
        content: sourceVersion.content,
        tags: sourceVersion.tags,
        latest_version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteIdNum)
      .select("*")
      .single();

    if (updateError || !updatedNoteData) {
      console.error("POST /api/notes/[noteId]/restore updateError:", updateError);
      return NextResponse.json({ error: "Failed to restore note" }, { status: 500 });
    }

    const { error: insertVersionError } = await supabase.from("user_note_versions").insert({
      note_id: noteIdNum,
      version: newVersion,
      content: sourceVersion.content,
      tags: sourceVersion.tags,
      ai_alignment_score: alignment.score,
      ai_alignment_summary: alignment.summary,
    });

    if (insertVersionError) {
      console.error("POST /api/notes/[noteId]/restore insertVersionError:", insertVersionError);
      return NextResponse.json({ error: "Failed to store restored version" }, { status: 500 });
    }

    await upsertNoteEmbedding(supabase, noteIdNum, sourceVersion.content);

    const { data: versionsData, error: versionsError } = await supabase
      .from("user_note_versions")
      .select("*")
      .eq("note_id", noteIdNum)
      .order("version", { ascending: false })
      .limit(20);

    if (versionsError) {
      console.error("POST /api/notes/[noteId]/restore versionsError:", versionsError);
      return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      note: updatedNoteData as NoteRow,
      currentVersion: newVersion,
      versions: versionsData || [],
    });

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }

    return response;
  } catch (error) {
    console.error("POST /api/notes/[noteId]/restore unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
