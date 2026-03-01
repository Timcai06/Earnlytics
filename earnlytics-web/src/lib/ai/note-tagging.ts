import { openai } from "@/lib/ai/openai-client";

const MAX_TAG_COUNT = 5;
const MAX_TAG_LENGTH = 12;

function extractJsonObject(raw: string): string {
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlock?.[1]) {
    return codeBlock[1].trim();
  }
  return raw.trim();
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const deduped = new Set<string>();

  for (const tag of tags) {
    if (typeof tag !== "string") continue;
    const normalized = tag.trim().replace(/^#/, "");
    if (!normalized || normalized.length > MAX_TAG_LENGTH) continue;
    deduped.add(normalized);
    if (deduped.size >= MAX_TAG_COUNT) break;
  }

  return Array.from(deduped);
}

export async function generateNoteTags(content: string): Promise<string[]> {
  const text = content.trim();
  if (!text) return [];

  if (!process.env.DEEPSEEK_API_KEY) {
    return [];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "你是投资研究助手。请从用户笔记里提取1到5个简短中文标签（不含#，每个<=12字）。仅返回JSON：{\"tags\":[...]}。",
        },
        {
          role: "user",
          content: text.slice(0, 4000),
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(extractJsonObject(raw));
    return normalizeTags(parsed?.tags);
  } catch (error) {
    console.error("Tag extraction failed:", error);
    return [];
  }
}
