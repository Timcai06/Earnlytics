import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";

function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(
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
    const resolvedSession = await resolveSessionFromRequest(request);

    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }

    if (!resolvedSession.appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!noteIdNum) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
    }

    const { data: note, error: noteError } = await supabase
      .from("user_notes")
      .select("id, latest_version")
      .eq("id", noteIdNum)
      .eq("user_id", resolvedSession.appUser.id)
      .maybeSingle();

    if (noteError) {
      console.error("GET /api/notes/[noteId]/versions noteError:", noteError);
      return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
    }

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const { data: versions, error: versionsError } = await supabase
      .from("user_note_versions")
      .select("*")
      .eq("note_id", noteIdNum)
      .order("version", { ascending: false });

    if (versionsError) {
      console.error("GET /api/notes/[noteId]/versions versionsError:", versionsError);
      return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
    }

    const response = NextResponse.json({
      noteId: noteIdNum,
      latestVersion: note.latest_version,
      versions: versions || [],
    });

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }

    return response;
  } catch (error) {
    console.error("GET /api/notes/[noteId]/versions unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
