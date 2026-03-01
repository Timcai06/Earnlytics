"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";

interface NoteSearchResult {
  noteId: number;
  earningId: number;
  symbol: string;
  tags: string[];
  updatedAt: string;
  similarity: number | null;
  snippet: string;
}

export default function NotesPageClient() {
  const { user, loading: authLoading } = useAuthUser();
  const [query, setQuery] = useState("");
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(
    async (searchQuery: string, symbolFilter: string) => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          limit: "30",
        });
        if (symbolFilter.trim()) {
          params.set("symbol", symbolFilter.trim().toUpperCase());
        }

        const response = await fetch(`/api/notes/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data?.error || "搜索失败");
          return;
        }

        setResults((data.results || []) as NoteSearchResult[]);
      } catch (err) {
        console.error("fetchResults error:", err);
        setError("搜索失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;
    fetchResults("", "");
  }, [fetchResults, user]);

  const subtitle = useMemo(() => {
    if (loading) return "搜索中...";
    return `共 ${results.length} 条备忘录`;
  }, [loading, results.length]);

  if (authLoading && !user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 text-3xl font-bold text-white">投资备忘录</h1>
        <p className="mb-6 text-text-secondary">正在验证登录状态...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 text-3xl font-bold text-white">投资备忘录</h1>
        <p className="mb-6 text-text-secondary">登录后可查看与搜索你的全部投资笔记。</p>
        <Button asChild>
          <Link href="/login">前往登录</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-white">投资备忘录中心</h1>
      <p className="mb-6 text-sm text-text-secondary">{subtitle}</p>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入语义关键词，例如：估值偏高"
          className="md:col-span-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="股票代码（可选）"
          className="md:col-span-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <Button
          onClick={() => fetchResults(query, symbol)}
          disabled={loading}
          className="md:col-span-1"
        >
          {loading ? "搜索中..." : "搜索"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {results.map((item) => (
          <Link
            key={`${item.noteId}-${item.earningId}`}
            href={`/earnings/${item.symbol.toLowerCase()}?earning_id=${item.earningId}#investment-memo`}
            className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary-light px-2 py-1 text-xs font-semibold text-primary">
                  {item.symbol}
                </span>
                {item.similarity !== null ? (
                  <span className="text-xs text-text-secondary">
                    语义匹配 {Math.round(item.similarity * 100)}%
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-text-tertiary">
                {new Date(item.updatedAt).toLocaleString("zh-CN")}
              </span>
            </div>
            <p className="mb-2 line-clamp-2 text-sm text-text-secondary">{item.snippet}</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={`${item.noteId}-${tag}`} className="rounded-full bg-surface-secondary px-2 py-1 text-xs text-text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}

        {!loading && results.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-secondary">
            暂无匹配结果，试试更短的关键词。
          </div>
        ) : null}
      </div>
    </div>
  );
}
