"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HeroTitleProps {
    className?: string;
}

export default function HeroTitle({ className }: HeroTitleProps) {
    return (
        <div className={cn("relative flex flex-col items-center py-10", className)}>
            {/* Background Decorative Text */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[100px] font-black tracking-tighter text-white/[0.03] sm:text-[150px] lg:text-[180px]">
                ANALYSIS
            </div>

            {/* Main Title Group */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative inline-block">
                    {/* Subtle Glow behind text */}
                    <div className="absolute inset-0 -inset-x-20 bg-primary/20 blur-[80px] opacity-50" />

                    <h1 className="relative flex flex-col items-center text-center leading-tight">
                        <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl lg:text-7xl">
                            让财报分析
                        </span>
                        <span className="mt-2 bg-gradient-to-r from-primary-hover via-[#e2cbff] to-primary bg-clip-text text-5xl font-black tracking-tighter text-transparent sm:text-7xl lg:text-8xl">
                            变得简单
                        </span>
                    </h1>
                </div>

                {/* Decorative Lines */}
                <div className="mt-8 flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary">
                        AI-POWERED INSIGHTS
                    </span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
                </div>
            </div>
        </div>
    );
}
