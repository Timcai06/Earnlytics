import type { SupabaseClient } from "@supabase/supabase-js";
import { generateNoteTags } from "@/lib/ai/note-tagging";
import {
  cosineSimilarity,
  generateTextEmbedding,
  isOpenAIEmbeddingEnabled,
} from "@/lib/ai/openai-embeddings";

interface AnalysisRow {
  summary: string | null;
  highlights: string[] | null;
  concerns: string[] | null;
}

export interface NoteAlignment {
  score: number | null;
  summary: string | null;
}

export function buildAlignmentSummary(score: number): string {
  if (score >= 0.75) {
    return "与AI分析高度一致，观点方向基本相同。";
  }
  if (score >= 0.55) {
    return "与AI分析部分一致，建议重点复核分歧点。";
  }
  return "与AI分析存在明显差异，建议补充论据后再决策。";
}

export async function verifyUserExists(
  supabase: SupabaseClient,
  userId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("verifyUserExists error:", error);
    return false;
  }

  return Boolean(data?.id);
}

export async function resolveEarningSymbol(
  supabase: SupabaseClient,
  earningId: number
): Promise<string | null> {
  const { data: earning, error: earningError } = await supabase
    .from("earnings")
    .select("company_id")
    .eq("id", earningId)
    .maybeSingle();

  if (earningError) {
    console.error("resolveEarningSymbol earning error:", earningError);
    return null;
  }

  if (!earning?.company_id) {
    return null;
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("symbol")
    .eq("id", earning.company_id)
    .maybeSingle();

  if (companyError) {
    console.error("resolveEarningSymbol company error:", companyError);
    return null;
  }

  return company?.symbol ?? null;
}

export async function fetchAIAnalysisContext(
  supabase: SupabaseClient,
  earningId: number
): Promise<string | null> {
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("summary, highlights, concerns")
    .eq("earnings_id", earningId)
    .maybeSingle();

  if (error) {
    console.error("fetchAIAnalysisContext error:", error);
    return null;
  }

  const analysis = data as AnalysisRow | null;
  if (!analysis) return null;

  const chunks: string[] = [];
  if (analysis.summary) chunks.push(`Summary: ${analysis.summary}`);
  if (analysis.highlights?.length) {
    chunks.push(`Highlights: ${analysis.highlights.join("；")}`);
  }
  if (analysis.concerns?.length) {
    chunks.push(`Concerns: ${analysis.concerns.join("；")}`);
  }

  const context = chunks.join("\n");
  return context.trim() ? context : null;
}

export async function computeNoteAlignment(
  noteContent: string,
  aiContext: string | null
): Promise<NoteAlignment> {
  if (!aiContext || !isOpenAIEmbeddingEnabled()) {
    return { score: null, summary: null };
  }

  try {
    const [noteEmbedding, contextEmbedding] = await Promise.all([
      generateTextEmbedding(noteContent),
      generateTextEmbedding(aiContext),
    ]);
    const score = cosineSimilarity(noteEmbedding, contextEmbedding);

    return {
      score: Number(score.toFixed(4)),
      summary: buildAlignmentSummary(score),
    };
  } catch (error) {
    console.error("computeNoteAlignment error:", error);
    return { score: null, summary: null };
  }
}

export async function upsertNoteEmbedding(
  supabase: SupabaseClient,
  noteId: number,
  content: string
): Promise<void> {
  if (!isOpenAIEmbeddingEnabled()) {
    return;
  }

  try {
    const embedding = await generateTextEmbedding(content);
    const { error } = await supabase.from("user_note_embeddings").upsert(
      {
        note_id: noteId,
        embedding,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "note_id" }
    );

    if (error) {
      console.error("upsertNoteEmbedding db error:", error);
    }
  } catch (error) {
    console.error("upsertNoteEmbedding error:", error);
  }
}

export async function extractNoteTags(content: string): Promise<string[]> {
  return generateNoteTags(content);
}
