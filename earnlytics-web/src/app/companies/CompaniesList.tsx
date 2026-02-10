"use client";

import Link from "next/link";
import { useState } from "react";
import type { Company } from "@/types/database";

interface CompaniesListProps {
  companies: Company[];
}

const getSectorStyle = (sector: string | null) => {
  const styles: Record<string, { border: string; shadow: string; animation: string }> = {
    "芯片": {
      border: "border-[#3B82F6]",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
      animation: "breathe-blue 3s ease-in-out infinite",
    },
    "软件": {
      border: "border-[#10B981]",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      animation: "breathe-emerald 3s ease-in-out infinite",
    },
    "电商": {
      border: "border-[#F59E0B]",
      shadow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
      animation: "breathe-amber 3s ease-in-out infinite",
    },
    "社交媒体": {
      border: "border-[#8B5CF6]",
      shadow: "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
      animation: "breathe-violet 3s ease-in-out infinite",
    },
    "消费电子": {
      border: "border-[#EC4899]",
      shadow: "shadow-[0_0_20px_rgba(236,72,153,0.4)]",
      animation: "breathe-pink 3s ease-in-out infinite",
    },
    "流媒体": {
      border: "border-[#EF4444]",
      shadow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
      animation: "breathe-red 3s ease-in-out infinite",
    },
    "汽车": {
      border: "border-[#06B6D4]",
      shadow: "shadow-[0_0_20px_rgba(6,182,212,0.4)]",
      animation: "breathe-cyan 3s ease-in-out infinite",
    },
  };
  
  return styles[sector || ""] || {
    border: "border-[#6366F1]",
    shadow: "shadow-[0_0_20px_rgba(99,102,241,0.4)]",
    animation: "breathe-indigo 3s ease-in-out infinite",
  };
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

const breathingStyles = `
  @keyframes breathe-blue {
    0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.7); }
    50% { box-shadow: 0 0 35px rgba(59,130,246,0.6), 0 0 70px rgba(59,130,246,0.25); border-color: rgba(59,130,246,1); }
  }
  @keyframes breathe-emerald {
    0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.7); }
    50% { box-shadow: 0 0 35px rgba(16,185,129,0.6), 0 0 70px rgba(16,185,129,0.25); border-color: rgba(16,185,129,1); }
  }
  @keyframes breathe-amber {
    0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.3), 0 0 40px rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.7); }
    50% { box-shadow: 0 0 35px rgba(245,158,11,0.6), 0 0 70px rgba(245,158,11,0.25); border-color: rgba(245,158,11,1); }
  }
  @keyframes breathe-violet {
    0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.7); }
    50% { box-shadow: 0 0 35px rgba(139,92,246,0.6), 0 0 70px rgba(139,92,246,0.25); border-color: rgba(139,92,246,1); }
  }
  @keyframes breathe-pink {
    0%, 100% { box-shadow: 0 0 20px rgba(236,72,153,0.3), 0 0 40px rgba(236,72,153,0.1); border-color: rgba(236,72,153,0.7); }
    50% { box-shadow: 0 0 35px rgba(236,72,153,0.6), 0 0 70px rgba(236,72,153,0.25); border-color: rgba(236,72,153,1); }
  }
  @keyframes breathe-red {
    0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.7); }
    50% { box-shadow: 0 0 35px rgba(239,68,68,0.6), 0 0 70px rgba(239,68,68,0.25); border-color: rgba(239,68,68,1); }
  }
  @keyframes breathe-cyan {
    0%, 100% { box-shadow: 0 0 20px rgba(6,182,212,0.3), 0 0 40px rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.7); }
    50% { box-shadow: 0 0 35px rgba(6,182,212,0.6), 0 0 70px rgba(6,182,212,0.25); border-color: rgba(6,182,212,1); }
  }
  @keyframes breathe-indigo {
    0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.7); }
    50% { box-shadow: 0 0 35px rgba(99,102,241,0.6), 0 0 70px rgba(99,102,241,0.25); border-color: rgba(99,102,241,1); }
  }
  .breathe-blue { animation: breathe-blue 3s ease-in-out infinite; }
  .breathe-emerald { animation: breathe-emerald 3s ease-in-out infinite; }
  .breathe-amber { animation: breathe-amber 3s ease-in-out infinite; }
  .breathe-violet { animation: breathe-violet 3s ease-in-out infinite; }
  .breathe-pink { animation: breathe-pink 3s ease-in-out infinite; }
  .breathe-red { animation: breathe-red 3s ease-in-out infinite; }
  .breathe-cyan { animation: breathe-cyan 3s ease-in-out infinite; }
  .breathe-indigo { animation: breathe-indigo 3s ease-in-out infinite; }
`;

export default function CompaniesList({ companies }: CompaniesListProps) {
  const [activeFilter, setActiveFilter] = useState("全部");

  const filteredCompanies =
    activeFilter === "全部"
      ? companies
      : companies.filter((c) => c.sector === activeFilter);

  return (
    <div className="flex flex-col">
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-3xl font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)] sm:text-[40px]">
            科技公司目录
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            探索我们覆盖的{companies.length}家美国科技巨头
          </p>
        </div>
      </section>

      <section className="bg-background px-4 pb-6 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-[#A1A1AA]">行业筛选：</span>
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeFilter === filter.value
                      ? "bg-primary text-white"
                      : "border border-[#6366F1] bg-[rgba(99,102,241,0.1)] text-[#E0E7FF] hover:bg-[rgba(99,102,241,0.2)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-[#64748B]">
            显示 {filteredCompanies.length} 家公司
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: breathingStyles }} />
      
      <section className="bg-background px-4 pb-24 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredCompanies.map((company) => {
              const style = getSectorStyle(company.sector);
              return (
                <div
                  key={company.symbol}
                  className={`rounded-2xl border-2 ${style.border} bg-surface-secondary p-6 sm:p-8 ${style.animation}`}
                >
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                      {company.symbol[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xl font-bold text-white sm:text-2xl">
                        {company.name}
                      </h3>
                      <p className="text-sm text-[#64748B]">NASDAQ: {company.symbol}</p>
                      <p className="text-sm text-[#64748B]">
                        行业：{company.sector || "科技"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#64748B]">最新财报</p>
                      <p className="text-sm font-semibold text-white sm:text-base">
                        点击查看详情
                      </p>
                    </div>
                    <Link
                      href={`/earnings?symbol=${company.symbol.toLowerCase()}`}
                      className="rounded-lg border border-[#6366F1] bg-[rgba(99,102,241,0.15)] px-4 py-2 text-sm font-semibold text-[#818CF8] sm:px-5 sm:py-2.5"
                    >
                      查看财报 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
