import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";
import {
  generateTextEmbedding,
  isOpenAIEmbeddingEnabled,
} from "@/lib/ai/openai-embeddings";

interface SearchResultRow {
  note_id: number;
  earning_id: number;
  symbol: string;
  content: string;
  tags: string[];
  updated_at: string;
  similarity: number;
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function createSnippet(content: string, query: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!query.trim()) return normalized.slice(0, 180);

  const lower = normalized.toLowerCase();
  const queryLower = query.toLowerCase();
  const idx = lower.indexOf(queryLower);
  if (idx < 0) return normalized.slice(0, 180);

  const start = Math.max(0, idx - 60);
  const end = Math.min(normalized.length, idx + query.length + 80);
  return `${start > 0 ? "..." : ""}${normalized.slice(start, end)}${end < normalized.length ? "..." : ""}`;
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 50);
    const resolvedSession = await resolveSessionFromRequest(request);

    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }

    if (!resolvedSession.appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = resolvedSession.appUser.id;

    if (!query) {
      let listQuery = supabase
        .from("user_notes")
        .select("id, earning_id, symbol, content, tags, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (symbol) {
        listQuery = listQuery.eq("symbol", symbol);
      }

      const { data, error } = await listQuery;

      if (error) {
        console.error("GET /api/notes/search list error:", error);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
      }

      const rows = (data || []) as Array<{
        id: number;
        earning_id: number;
        symbol: string;
        content: string;
        tags: string[] | null;
        updated_at: string;
      }>;

      const results = rows.map((row) => ({
        noteId: row.id,
        earningId: row.earning_id,
        symbol: row.symbol,
        tags: row.tags || [],
        updatedAt: row.updated_at,
        similarity: null,
        snippet: createSnippet(row.content || "", ""),
      }));

      const response = NextResponse.json({ results });
      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session);
      }
      return response;
    }

    if (isOpenAIEmbeddingEnabled()) {
      const embedding = await generateTextEmbedding(query);
      const { data: semanticData, error: semanticError } = await supabase.rpc(
        "search_user_notes",
        {
          query_embedding: embedding,
          target_user_id: userId,
          filter_symbol: symbol || null,
          match_count: limit,
          match_threshold: 0.2,
        }
      );

      if (!semanticError && semanticData) {
        const results = (semanticData as SearchResultRow[]).map((row) => ({
          noteId: row.note_id,
          earningId: row.earning_id,
          symbol: row.symbol,
          tags: row.tags || [],
          updatedAt: row.updated_at,
          similarity: row.similarity,
          snippet: createSnippet(row.content || "", query),
        }));
        const response = NextResponse.json({ results });
        if (resolvedSession.refreshed && resolvedSession.session) {
          applySessionCookies(response, resolvedSession.session);
        }
        return response;
      }

      if (semanticError) {
        console.error("GET /api/notes/search semantic error:", semanticError);
      }
    }

    let fallbackQuery = supabase
      .from("user_notes")
      .select("id, earning_id, symbol, content, tags, updated_at")
      .eq("user_id", userId)
      .ilike("content", `%${query}%`)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (symbol) {
      fallbackQuery = fallbackQuery.eq("symbol", symbol);
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
    if (fallbackError) {
      console.error("GET /api/notes/search fallback error:", fallbackError);
      return NextResponse.json({ error: "Failed to search notes" }, { status: 500 });
    }

    const fallbackRows = (fallbackData || []) as Array<{
      id: number;
      earning_id: number;
      symbol: string;
      content: string;
      tags: string[] | null;
      updated_at: string;
    }>;

    const results = fallbackRows.map((row) => ({
      noteId: row.id,
      earningId: row.earning_id,
      symbol: row.symbol,
      tags: row.tags || [],
      updatedAt: row.updated_at,
      similarity: null,
      snippet: createSnippet(row.content || "", query),
    }));

    const response = NextResponse.json({ results });
    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }
    return response;
  } catch (error) {
    console.error("GET /api/notes/search unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
