"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/use-auth-user";

interface AISummary {
  summary?: string;
  highlights?: string[] | null;
  concerns?: string[] | null;
}

interface NoteVersion {
  id: number;
  version: number;
  content: string;
  tags: string[];
  ai_alignment_score: number | null;
  ai_alignment_summary: string | null;
  created_at: string;
}

interface UserNote {
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

interface InvestmentMemoPanelProps {
  earningId: number;
  symbol: string;
  aiSummary?: AISummary;
  className?: string;
}

const MAX_CONTENT_LENGTH = 12000;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markdownToHtml(markdown: string): string {
  let html = escapeHtml(markdown);

  html = html
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-border pl-3 my-2 text-text-secondary">$1</blockquote>')
    .replace(/^[-*] (.+)$/gm, '<div class="ml-4 my-1">• $1</div>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-surface px-1 py-0.5 text-sm">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
    .replace(/\n/g, "<br />");

  return html;
}

export function InvestmentMemoPanel({
  earningId,
  symbol,
  aiSummary,
  className,
}: InvestmentMemoPanelProps) {
  const { user: authUser, loading: authLoading } = useAuthUser();
  const activeUserId = authUser?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [note, setNote] = useState<UserNote | null>(null);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentAlignment = versions[0] || null;
  const draftKey = useMemo(
    () => (activeUserId ? `note-draft:${activeUserId}:${earningId}` : null),
    [activeUserId, earningId]
  );

  const loadNote = useCallback(async () => {
    if (!activeUserId) {
      setLoading(false);
      setNote(null);
      setVersions([]);
      setTags([]);
      setContent("");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes?earning_id=${earningId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "加载备忘录失败");
        return;
      }

      if (data.note) {
        const loadedNote = data.note as UserNote;
        const loadedVersions = (data.versions || []) as NoteVersion[];
        setNote(loadedNote);
        setVersions(loadedVersions);
        setTags(loadedNote.tags || []);
        setContent(loadedNote.content || "");
        setIsDirty(false);
        if (draftKey) {
          localStorage.removeItem(draftKey);
        }
      } else {
        setNote(null);
        setVersions([]);
        setTags([]);

        const draft = draftKey ? localStorage.getItem(draftKey) : null;
        if (draft) {
          setContent(draft);
          setIsDirty(true);
        } else {
          setContent("");
          setIsDirty(false);
        }
      }
    } catch (err) {
      console.error("Failed to load note:", err);
      setError("加载备忘录失败");
    } finally {
      setLoading(false);
    }
  }, [activeUserId, draftKey, earningId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  useEffect(() => {
    if (!draftKey || !isDirty || !activeUserId) return;
    localStorage.setItem(draftKey, content);
  }, [activeUserId, content, draftKey, isDirty]);

  const setContentWithDirty = (nextValue: string) => {
    setContent(nextValue);
    setIsDirty(true);
  };

  const insertAroundSelection = (before: string, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const nextValue =
      content.slice(0, start) +
      before +
      (selected || placeholder) +
      after +
      content.slice(end);

    setContentWithDirty(nextValue);
    requestAnimationFrame(() => {
      const cursor = start + before.length + (selected || placeholder).length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const prefixSelectedLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const lines = (selected || "").split("\n");
    const prefixed = lines.map((line) => `${prefix}${line}`).join("\n");

    const nextValue = content.slice(0, start) + prefixed + content.slice(end);
    setContentWithDirty(nextValue);
  };

  const saveNote = async () => {
    if (!activeUserId) return;
    const trimmed = content.trim();
    if (!trimmed) {
      setError("内容不能为空");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          earning_id: earningId,
          symbol,
          content: trimmed,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "保存失败");
        return;
      }

      setNote(data.note as UserNote);
      setVersions((data.versions || []) as NoteVersion[]);
      setTags((data.note?.tags || []) as string[]);
      setContent((data.note?.content || "") as string);
      setIsDirty(false);
      if (draftKey) {
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      console.error("saveNote error:", err);
      setError("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = async (version: number) => {
    if (!activeUserId || !note) return;
    if (!confirm(`确认恢复到 v${version} 吗？`)) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes/${note.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "恢复失败");
        return;
      }

      setNote(data.note as UserNote);
      setVersions((data.versions || []) as NoteVersion[]);
      setTags((data.note?.tags || []) as string[]);
      setContent((data.note?.content || "") as string);
      setIsDirty(false);
      if (draftKey) {
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      console.error("restoreVersion error:", err);
      setError("恢复失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  const showLoginHint = !authLoading && !activeUserId;
  const htmlPreview = useMemo(() => markdownToHtml(content), [content]);

  return (
    <section
      id="investment-memo"
      className={cn("rounded-xl border border-border bg-surface p-4 sm:p-6", className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">📝 AI 投资备忘录</h3>
          <p className="text-sm text-text-secondary">
            记录你的判断，自动提取标签并对齐 AI 分析
          </p>
        </div>
        {activeUserId ? (
          <Button
            onClick={saveNote}
            disabled={saving || !content.trim() || content.length > MAX_CONTENT_LENGTH}
          >
            {saving ? "保存中..." : "保存"}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">登录后使用</Link>
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {authLoading && !activeUserId ? (
        <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-secondary">
          正在验证登录状态...
        </div>
      ) : showLoginHint ? (
        <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-secondary">
          登录后可为当前财报保存笔记、查看历史版本和语义搜索。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <Button
                type="button"
                variant={activeTab === "edit" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("edit")}
              >
                编辑
              </Button>
              <Button
                type="button"
                variant={activeTab === "preview" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("preview")}
              >
                预览
              </Button>
            </div>

            {activeTab === "edit" && (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => prefixSelectedLines("# ")}>
                    H1
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => prefixSelectedLines("## ")}>
                    H2
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAroundSelection("**", "**", "加粗文本")}>
                    粗体
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAroundSelection("*", "*", "斜体文本")}>
                    斜体
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => prefixSelectedLines("- ")}>
                    列表
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => prefixSelectedLines("> ")}>
                    引用
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertAroundSelection("`", "`", "代码")}>
                    行内代码
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertAroundSelection("[", "](https://)", "链接文本")}
                  >
                    链接
                  </Button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContentWithDirty(e.target.value)}
                  rows={14}
                  placeholder="写下你的投资备忘录，例如：估值偏高，等待回调后再加仓。"
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary"
                />
              </>
            )}

            {activeTab === "preview" && (
              <div
                className="min-h-[280px] rounded-lg border border-border bg-background p-4 text-sm text-white"
                dangerouslySetInnerHTML={{ __html: htmlPreview || "<span class='text-text-secondary'>暂无内容</span>" }}
              />
            )}

            <div className="mt-2 flex items-center justify-between text-xs text-text-tertiary">
              <span>
                {loading ? "加载中..." : note ? `当前版本 v${note.latest_version}` : "未保存"}
              </span>
              <span>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <h4 className="mb-2 text-sm font-semibold text-white">🏷️ 自动标签</h4>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-light px-2 py-1 text-xs text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">保存后自动生成标签</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <h4 className="mb-2 text-sm font-semibold text-white">🤖 AI 关联</h4>
              {currentAlignment?.ai_alignment_summary ? (
                <>
                  <p className="mb-2 text-xs text-text-secondary">
                    相似度:{" "}
                    <span className="text-white">
                      {Math.round((currentAlignment.ai_alignment_score || 0) * 100)}%
                    </span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    {currentAlignment.ai_alignment_summary}
                  </p>
                </>
              ) : (
                <p className="text-xs text-text-secondary">
                  保存后自动计算与 AI 分析的一致度
                </p>
              )}
            </div>

            {aiSummary && (
              <div className="rounded-lg border border-border bg-background p-4">
                <h4 className="mb-2 text-sm font-semibold text-white">AI 分析要点</h4>
                {aiSummary.summary ? (
                  <p className="mb-2 text-xs text-text-secondary line-clamp-4">
                    {aiSummary.summary}
                  </p>
                ) : null}
                {aiSummary.highlights?.slice(0, 2).map((item, idx) => (
                  <p key={`${item}-${idx}`} className="text-xs text-success">
                    • {item}
                  </p>
                ))}
                {aiSummary.concerns?.slice(0, 2).map((item, idx) => (
                  <p key={`${item}-${idx}`} className="text-xs text-warning">
                    • {item}
                  </p>
                ))}
              </div>
            )}

            <details className="rounded-lg border border-border bg-background p-4">
              <summary className="cursor-pointer text-sm font-semibold text-white">
                查看历史笔记 ({versions.length})
              </summary>
              <div className="mt-3 space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-md border border-border bg-surface p-2"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        v{version.version} ·{" "}
                        {new Date(version.created_at).toLocaleString("zh-CN")}
                      </span>
                      {note && version.version !== note.latest_version ? (
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => restoreVersion(version.version)}
                          disabled={saving}
                        >
                          恢复
                        </button>
                      ) : (
                        <span className="text-success">当前</span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-text-secondary">
                      {version.content}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </section>
  );
}

export default InvestmentMemoPanel;
