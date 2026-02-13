"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import type { CompanyWithEarnings } from "./page";
import { SearchIcon, LayoutGridIcon, ListIcon, ArrowUpDownIcon } from "@/components/icons";
import { CompanyCardSkeleton } from "@/components/ui/skeleton";
import { SearchEmptyState, NoDataState } from "@/components/ui/empty-state";

interface CompaniesListProps {
  companies: CompanyWithEarnings[];
}

type ViewMode = "grid" | "list";
type SortOption = "symbol-asc" | "symbol-desc" | "date-desc" | "date-asc";

const getSectorStyle = (sector: string | null) => {
  const styles: Record<string, { color: string; bgColor: string }> = {
    "芯片": { color: "text-info", bgColor: "bg-info/10" },
    "软件": { color: "text-success", bgColor: "bg-success/10" },
    "电商": { color: "text-warning", bgColor: "bg-warning/10" },
    "社交媒体": { color: "text-primary", bgColor: "bg-primary/10" },
    "消费电子": { color: "text-error", bgColor: "bg-error/10" },
    "流媒体": { color: "text-error", bgColor: "bg-error/10" },
    "汽车": { color: "text-success", bgColor: "bg-success/10" },
  };

  return styles[sector || ""] || { color: "text-primary", bgColor: "bg-primary/10" };
};

const filters = [
  { label: "全部", value: "全部" },
  { label: "芯片", value: "芯片" },
  { label: "软件", value: "软件" },
  { label: "电商", value: "电商" },
  { label: "社交媒体", value: "社交媒体" },
  { label: "消费电子", value: "消费电子" },
  { label: "流媒体", value: "流媒体" },
  { label: "汽车", value: "汽车" },
];

const sortOptions = [
  { label: "代码 A-Z", value: "symbol-asc" },
  { label: "代码 Z-A", value: "symbol-desc" },
  { label: "财报日期 (新→旧)", value: "date-desc" },
  { label: "财报日期 (旧→新)", value: "date-asc" },
];

function formatEarningDate(dateStr: string | null): string {
  if (!dateStr) return "暂无数据";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CompaniesList({ companies }: CompaniesListProps) {
  const [activeFilter, setActiveFilter] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("symbol-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...companies];

    if (activeFilter !== "全部") {
      result = result.filter((c) => c.sector === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.symbol.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "symbol-asc":
          return a.symbol.localeCompare(b.symbol);
        case "symbol-desc":
          return b.symbol.localeCompare(a.symbol);
        case "date-desc":
          const dateA = a.latestEarning?.report_date || "";
          const dateB = b.latestEarning?.report_date || "";
          return dateB.localeCompare(dateA);
        case "date-asc":
          const dateA2 = a.latestEarning?.report_date || "";
          const dateB2 = b.latestEarning?.report_date || "";
          return dateA2.localeCompare(dateB2);
        default:
          return 0;
      }
    });

    return result;
  }, [companies, activeFilter, searchQuery, sortBy]);

  const clearFilters = () => {
    setActiveFilter("全部");
    setSearchQuery("");
    setSortBy("symbol-asc");
  };

  if (companies.length === 0) {
    return (
      <div className="flex flex-col">
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-20">
          <div className="flex flex-col items-center text-center">
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              科技公司目录
            </h1>
            <p className="text-lg text-text-secondary">
              探索我们覆盖的美国科技巨头
            </p>
          </div>
        </section>
        <section className="bg-background px-4 pb-24 sm:px-6 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <NoDataState 
              title="暂无公司数据" 
              description="数据库中还没有公司信息，请先运行数据导入脚本"
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            科技公司目录
          </h1>
          <p className="text-lg text-text-secondary">
            探索我们覆盖的{companies.length}家美国科技巨头
          </p>
        </div>
      </section>

      <section className="bg-background px-4 pb-6 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="搜索公司名称或股票代码..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-white placeholder:text-text-tertiary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "text-text-tertiary hover:text-white"
                  }`}
                  title="网格视图"
                >
                  <LayoutGridIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "text-text-tertiary hover:text-white"
                  }`}
                  title="列表视图"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <ArrowUpDownIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 appearance-none rounded-lg border border-border bg-surface pl-9 pr-8 text-sm text-white focus:border-primary focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-text-secondary">行业筛选：</span>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    activeFilter === filter.value
                      ? "bg-primary text-white"
                      : "border border-primary bg-primary/10 text-primary-foreground hover:bg-primary/20"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-text-tertiary">
            显示 {filteredAndSortedCompanies.length} / {companies.length} 家公司
          </p>
        </div>
      </section>

      <section className="bg-background px-4 pb-24 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CompanyCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CompanyCardSkeleton key={i} className="h-20" />
                ))}
              </div>
            )
          ) : filteredAndSortedCompanies.length === 0 ? (
            <SearchEmptyState 
              query={searchQuery}
              onClearAction={clearFilters}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredAndSortedCompanies.map((company) => {
                const style = getSectorStyle(company.sector);
                const hasAnalyzed = company.latestEarning?.is_analyzed;
                const epsSurprise = company.latestEarning?.eps_surprise;

                return (
                  <div
                    key={company.symbol}
                    className="rounded-2xl border-2 bg-surface p-6 transition-all hover:bg-surface-secondary"
                    style={{ borderColor: style.color }}
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <div 
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white sm:h-20 sm:w-20 sm:text-3xl"
                        style={{ backgroundColor: style.color + "20", color: style.color }}
                      >
                        {company.symbol[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-xl font-bold text-white sm:text-2xl">
                            {company.name}
                          </h3>
                          {hasAnalyzed && (
                            <span className="flex-shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                              AI分析
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-tertiary">
                          NASDAQ: {company.symbol}
                        </p>
                        <span 
                          className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs ${style.bgColor}`}
                          style={{ color: style.color }}
                        >
                          {company.sector || "科技"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 h-px bg-surface-secondary" />

                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary">最新财报</p>
                        <p className="text-sm font-medium text-white">
                          {company.latestEarning
                            ? `Q${company.latestEarning.fiscal_quarter} FY${company.latestEarning.fiscal_year}`
                            : "暂无数据"}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {formatEarningDate(company.latestEarning?.report_date || null)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">EPS</p>
                        <p className="text-sm font-medium text-white">
                          {company.latestEarning?.eps
                            ? `$${company.latestEarning.eps}`
                            : "N/A"}
                        </p>
                        {epsSurprise !== null && epsSurprise !== undefined && (
                          <p
                            className={`text-xs ${
                              epsSurprise > 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {epsSurprise > 0 ? "+" : ""}
                            {epsSurprise}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/earnings/${company.symbol.toLowerCase()}`}
                      className="block w-full rounded-lg border border-primary bg-primary/15 py-2.5 text-center text-sm font-semibold text-primary-hover transition-colors hover:bg-primary/25"
                    >
                      查看财报 →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedCompanies.map((company) => {
                const style = getSectorStyle(company.sector);
                const hasAnalyzed = company.latestEarning?.is_analyzed;
                const epsSurprise = company.latestEarning?.eps_surprise;

                return (
                  <div
                    key={company.symbol}
                    className="flex items-center gap-4 rounded-xl border-2 bg-surface p-4 transition-colors hover:bg-surface-secondary"
                    style={{ borderColor: style.color }}
                  >
                    <div 
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
                      style={{ backgroundColor: style.color + "20", color: style.color }}
                    >
                      {company.symbol[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">
                          {company.name}
                        </h3>
                        <span className="text-sm text-text-tertiary">
                          {company.symbol}
                        </span>
                        {hasAnalyzed && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-tertiary">
                        <span style={{ color: style.color }}>{company.sector || "科技"}</span>
                        {company.latestEarning
                          ? ` · Q${company.latestEarning.fiscal_quarter} FY${company.latestEarning.fiscal_year} · ${formatEarningDate(company.latestEarning.report_date)}`
                          : " · 暂无财报数据"}
                      </p>
                    </div>

                    <div className="hidden flex-shrink-0 text-right sm:block">
                      <p className="text-sm text-text-tertiary">EPS</p>
                      <p className="font-medium text-white">
                        {company.latestEarning?.eps
                          ? `$${company.latestEarning.eps}`
                          : "N/A"}
                      </p>
                      {epsSurprise !== null && epsSurprise !== undefined && (
                        <p
                          className={`text-xs ${
                            epsSurprise > 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {epsSurprise > 0 ? "+" : ""}
                          {epsSurprise}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/earnings/${company.symbol.toLowerCase()}`}
                      className="flex-shrink-0 rounded-lg border border-primary bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-hover transition-colors hover:bg-primary/25"
                    >
                      查看 →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
