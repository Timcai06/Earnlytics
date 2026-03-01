"use client";

import { SparklesIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { ViewportRender } from "@/components/performance";

export default function AIFeaturedInsight() {
    return (
        <ViewportRender rootMargin="200px 0px" fallback={<div className="h-[300px] w-full" />}>
            <div className="w-full max-w-5xl mx-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center overflow-hidden">
                    {/* Background elements */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                AI 核心洞察
                            </span>
                            <span className="text-xs text-text-tertiary">2026 最新季度财报</span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            NVIDIA Q4: 数据中心再造神话，AI 需求“深不可测”
                        </h3>

                        <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
                            本季度数据中心营收达到创纪录的 184 亿美元，同比增长逾 400%。Hopper 架构需求持续强劲，同时下代 Blackwell 芯片即将推出。管理层表示，AI 基础设施的投资周期依然处于早期阶段，全球算力升级浪潮刚刚开启。
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <Link
                                href="/companies?q=NVDA"
                                className="flex items-center gap-2"
                            >
                                <span className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg">
                                    查看完整财报分析
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="w-full md:w-80 flex flex-col gap-3 shrink-0">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center transition-colors hover:bg-white/10">
                            <div>
                                <div className="text-text-tertiary text-xs mb-1">本季营收 (Revenue)</div>
                                <div className="text-white font-semibold text-lg">$22.1B</div>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg text-sm font-medium">
                                <TrendingUpIcon className="w-4 h-4" />
                                +265%
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center transition-colors hover:bg-white/10">
                            <div>
                                <div className="text-text-tertiary text-xs mb-1">每股收益 (EPS)</div>
                                <div className="text-white font-semibold text-lg">$5.16</div>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg text-sm font-medium">
                                <TrendingUpIcon className="w-4 h-4" />
                                +486%
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center transition-colors hover:bg-white/10">
                            <div>
                                <div className="text-text-tertiary text-xs mb-1">市场预期超额 (Surprise)</div>
                                <div className="text-white font-semibold text-lg">+11.4%</div>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg text-sm font-medium">
                                <TrendingUpIcon className="w-4 h-4" />
                                Beat
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ViewportRender>
    );
}
