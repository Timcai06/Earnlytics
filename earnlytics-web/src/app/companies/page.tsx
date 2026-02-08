"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

// Mock company data
const companies = [
  {
    id: "aapl",
    name: "Apple Inc.",
    symbol: "AAPL",
    industry: "chip",
    logo: "A",
    quarter: "Q1 FY2026",
    date: "2026.01.28",
  },
  {
    id: "msft",
    name: "Microsoft",
    symbol: "MSFT",
    industry: "software",
    logo: "M",
    quarter: "Q2 FY2026",
    date: "2026.01.29",
  },
  {
    id: "nvda",
    name: "NVIDIA",
    symbol: "NVDA",
    industry: "chip",
    logo: "N",
    quarter: "Q4 FY2026",
    date: "2026.02.10",
  },
  {
    id: "googl",
    name: "Alphabet",
    symbol: "GOOGL",
    industry: "internet",
    logo: "G",
    quarter: "Q4 FY2026",
    date: "2026.02.04",
  },
  {
    id: "amzn",
    name: "Amazon",
    symbol: "AMZN",
    industry: "ecommerce",
    logo: "A",
    quarter: "Q4 FY2026",
    date: "2026.02.06",
  },
  {
    id: "meta",
    name: "Meta",
    symbol: "META",
    industry: "social",
    logo: "M",
    quarter: "Q4 FY2026",
    date: "2026.02.05",
  },
  {
    id: "tsla",
    name: "Tesla",
    symbol: "TSLA",
    industry: "automotive",
    logo: "T",
    quarter: "Q4 FY2026",
    date: "2026.01.29",
  },
  {
    id: "amd",
    name: "AMD",
    symbol: "AMD",
    industry: "chip",
    logo: "A",
    quarter: "Q4 FY2026",
    date: "2026.02.11",
  },
];

const industries = [
  { key: "all", label: "全部" },
  { key: "chip", label: "芯片" },
  { key: "software", label: "软件" },
  { key: "ecommerce", label: "电商" },
  { key: "social", label: "社交媒体" },
];

export default function CompaniesPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCompanies =
    activeFilter === "all"
      ? companies
      : companies.filter((c) => c.industry === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="px-20 py-20 text-center">
        <h1 className="mb-4 text-[48px] font-bold text-text-primary">
          科技公司目录
        </h1>
        <p className="text-xl text-text-secondary">
          探索我们覆盖的30+美国科技巨头
        </p>
      </section>

      {/* Filter Section */}
      <section className="px-20 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-text-primary">
              行业筛选：
            </span>
            <div className="flex gap-2">
              {industries.map((industry) => (
                <Button
                  key={industry.key}
                  variant={activeFilter === industry.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(industry.key)}
                  className="min-w-[100px]"
                >
                  {industry.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="px-20 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <Card
                key={company.symbol}
                className="overflow-hidden border-border bg-surface"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-6">
                    {/* Logo */}
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-slate-100">
                      <span className="text-2xl font-bold text-slate-600">
                        {company.logo}
                      </span>
                    </div>

                    {/* Company Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-text-primary">
                          {company.name}
                        </h3>
                        <span className="text-base text-text-tertiary">
                          {company.symbol}
                        </span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary">
                            {company.quarter}
                          </p>
                          <p className="text-sm text-text-tertiary">
                            {company.date}
                          </p>
                        </div>
                        <Link href={`/earnings/${company.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            查看
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="py-12 text-center text-text-tertiary">
              暂无该公司分类数据
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
