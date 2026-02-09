"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/types/database";

interface CompaniesPageProps {
  companies: Company[];
}

const getSectorStyle = (sector: string | null) => {
  switch (sector) {
    case "芯片":
      return {
        border: "border-[#76B900]",
        shadow: "shadow-[0_0_20px_rgba(118,185,0,0.13)]",
      };
    case "软件":
      return {
        border: "border-[#22C55E]",
        shadow: "shadow-[0_0_20px_rgba(34,197,94,0.13)]",
      };
    case "电商":
      return {
        border: "border-[#F97316]",
        shadow: "shadow-[0_0_20px_rgba(249,115,22,0.13)]",
      };
    case "社交媒体":
      return {
        border: "border-[#6366F1]",
        shadow: "shadow-[0_0_20px_rgba(99,102,241,0.13)]",
      };
    case "消费电子":
      return {
        border: "border-[#EC4899]",
        shadow: "shadow-[0_0_20px_rgba(236,72,153,0.13)]",
      };
    case "流媒体":
      return {
        border: "border-[#EF4444]",
        shadow: "shadow-[0_0_20px_rgba(239,68,68,0.13)]",
      };
    case "汽车":
      return {
        border: "border-[#14B8A6]",
        shadow: "shadow-[0_0_20px_rgba(20,184,166,0.13)]",
      };
    default:
      return {
        border: "border-[#3B82F6]",
        shadow: "shadow-[0_0_20px_rgba(59,130,246,0.13)]",
      };
  }
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

function CompaniesList({ companies }: CompaniesPageProps) {
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

      <section className="bg-background px-4 pb-24 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredCompanies.map((company) => {
              const style = getSectorStyle(company.sector);
              return (
                <div
                  key={company.symbol}
                  className={`rounded-2xl border ${style.border} bg-surface-secondary p-6 sm:p-8 ${style.shadow}`}
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
                      href={`/earnings/${company.symbol.toLowerCase()}`}
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

async function getCompanies(): Promise<Company[]> {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("symbol", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }

  return companies || [];
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return <CompaniesList companies={companies} />;
}
