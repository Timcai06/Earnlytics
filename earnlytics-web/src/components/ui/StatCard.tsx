"use client";

import React, { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface SciFiStatCardProps {
    label: string;
    value: string;
    className?: string;
}

export default function SciFiStatCard({
    label,
    value,
    className,
}: SciFiStatCardProps) {
    const [displayValue, setDisplayValue] = useState("0");

    // Parse numeric part of the value (e.g., "30+" -> 30)
    const numericValue = parseInt(value) || 0;
    const suffix = value.replace(/[0-9]/g, "");

    useEffect(() => {
        const controls = animate(0, numericValue, {
            duration: 2,
            onUpdate(value) {
                setDisplayValue(Math.floor(value).toString());
            },
            ease: "easeOut",
        });
        return () => controls.stop();
    }, [numericValue]);

    return (
        <div className={cn("group relative flex flex-col items-center", className)}>
            {/* Outer Glow */}
            <div className="absolute -inset-4 bg-primary/5 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Corner Brackets */}
            <span className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-primary/40 transition-all duration-300 group-hover:h-3 group-hover:w-3 group-hover:border-primary" />
            <span className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-primary/40 transition-all duration-300 group-hover:h-3 group-hover:w-3 group-hover:border-primary" />
            <span className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-primary/40 transition-all duration-300 group-hover:h-3 group-hover:w-3 group-hover:border-primary" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-primary/40 transition-all duration-300 group-hover:h-3 group-hover:w-3 group-hover:border-primary" />

            {/* Main Display Area */}
            <div className="relative flex flex-col items-center px-4 py-2">
                <div className="flex items-baseline">
                    <span className="bg-gradient-to-b from-white to-primary/80 bg-clip-text text-3xl font-black tracking-tighter text-transparent sm:text-4xl lg:text-5xl drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        {displayValue}
                    </span>
                    <span className="ml-0.5 text-lg font-bold text-primary sm:text-xl">
                        {suffix}
                    </span>
                </div>

                <span className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary transition-colors duration-300 group-hover:text-primary-hover">
                    {label}
                </span>
            </div>

            {/* Scanning Line */}
            <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100"
            />

            {/* Background Dots */}
            <div className="absolute inset-0 z-[-1] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="h-full w-full bg-[radial-gradient(primary_1px,transparent_1px)] [background-size:10px_10px] opacity-[0.03]" />
            </div>
        </div>
    );
}
