"use client";

import { ActivityIcon, CpuIcon, Gamepad2Icon, HeartPulseIcon, ShoppingCartIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { ViewportRender } from "@/components/performance";

const sectors = [
    { name: "人工智能", icon: CpuIcon, color: "text-blue-400", bg: "bg-blue-400/10", border: "hover:border-blue-400/30" },
    { name: "云计算", icon: ZapIcon, color: "text-amber-400", bg: "bg-amber-400/10", border: "hover:border-amber-400/30" },
    { name: "半导体", icon: ActivityIcon, color: "text-rose-400", bg: "bg-rose-400/10", border: "hover:border-rose-400/30" },
    { name: "消费电子", icon: ShoppingCartIcon, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "hover:border-emerald-400/30" },
    { name: "生物医疗", icon: HeartPulseIcon, color: "text-pink-400", bg: "bg-pink-400/10", border: "hover:border-pink-400/30" },
    { name: "互动娱乐", icon: Gamepad2Icon, color: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/30" },
];

export default function ExploreSectors() {
    return (
        <ViewportRender rootMargin="200px 0px" fallback={<div className="h-[200px] w-full" />}>
            <section className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                        </span>
                        热门板块探索
                    </h2>
                    <Link
                        href="/companies"
                        className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all duration-200"
                    >
                        全部公司
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {sectors.map((sector) => {
                        const Icon = sector.icon;
                        return (
                            <Link
                                key={sector.name}
                                href={`/companies?q=${sector.name}`}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-surface/30 border border-white/5 transition-all duration-300 hover:bg-surface/50 hover:-translate-y-1 ${sector.border} group`}
                            >
                                <div className={`p-4 rounded-xl ${sector.bg} ${sector.color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                                    {sector.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </section>
        </ViewportRender>
    );
}
