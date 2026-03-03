import type { Metadata } from "next";
import NotesPageClient from "./NotesPageClient";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { resolveSessionFromCookieHeader } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "投资备忘录 - Earnlytics",
  description: "跨财报搜索并管理你的 AI 投资备忘录",
  robots: {
    index: false,
    follow: false,
  },
};

function buildCookieHeader() {
  return cookies()
    .then((store) => store.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; "))
    .catch(() => "");
}

function createSnippet(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.slice(0, 180);
}

type NoteRow = {
  id: number;
  earning_id: number;
  symbol: string;
  tags: string[] | null;
  content: string;
  updated_at: string;
};

export default async function NotesPage() {
  const cookieHeader = await buildCookieHeader();
  const resolved = await resolveSessionFromCookieHeader(cookieHeader || null);
  const supabase = getSupabaseAdmin();
  let initialResults: Array<{
    noteId: number;
    earningId: number;
    symbol: string;
    tags: string[];
    updatedAt: string;
    similarity: null;
    snippet: string;
  }> | undefined;

  if (supabase && !resolved.error && resolved.appUser) {
    try {
      const { data, error } = await supabase
        .from("user_notes")
        .select("id, earning_id, symbol, tags, content, updated_at")
        .eq("user_id", resolved.appUser.id)
        .order("updated_at", { ascending: false })
        .limit(30);

      if (!error) {
        initialResults = ((data || []) as NoteRow[]).map((row) => ({
          noteId: row.id,
          earningId: row.earning_id,
          symbol: row.symbol,
          tags: row.tags || [],
          updatedAt: row.updated_at,
          similarity: null,
          snippet: createSnippet(row.content || ""),
        }));
      }
    } catch {
      initialResults = undefined;
    }
  }

  return <NotesPageClient initialResults={initialResults} />;
}
