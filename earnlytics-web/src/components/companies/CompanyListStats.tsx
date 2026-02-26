"use client";

import { motion, useSpring, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { Building2Icon, BrainCircuitIcon, PieChartIcon } from "lucide-react";

interface CompanyListStatsProps {
    totalCompanies: number;
    analyzedCount: number;
    sectorCount: number;
}

function Counter({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-20px" });
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, value, spring]);

    useEffect(() => {
        return spring.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Math.round(latest).toString();
            }
        });
    }, [spring]);

    return <span ref={ref} className="tabular-nums">0</span>;
}

export default function CompanyListStats({
    totalCompanies,
    analyzedCount,
    sectorCount,
}: CompanyListStatsProps) {
    return (
        <div className="w-full flex justify-center py-2">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-8 py-4 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-xl shadow-2xl shadow-primary/5"
            >
                {/* Total Companies */}
                <div className="group relative flex items-center gap-4 min-w-[140px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors duration-300">
                        <Building2Icon className="h-6 w-6 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-3xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                            <Counter value={totalCompanies} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">收录公司</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                {/* Analyzed Count */}
                <div className="group relative flex items-center gap-4 min-w-[140px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-colors duration-300">
                        <BrainCircuitIcon className="h-6 w-6 text-text-secondary group-hover:text-emerald-400 transition-colors duration-300" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                            <Counter value={analyzedCount} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">AI深度分析</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                {/* Sectors */}
                <div className="group relative flex items-center gap-4 min-w-[140px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-colors duration-300">
                        <PieChartIcon className="h-6 w-6 text-text-secondary group-hover:text-cyan-400 transition-colors duration-300" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                            <Counter value={sectorCount} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">覆盖行业</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
