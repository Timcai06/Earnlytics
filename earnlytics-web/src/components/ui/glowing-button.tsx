"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface GlowingButtonProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export default function GlowingButton({
    href,
    children,
    className,
}: GlowingButtonProps) {
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!buttonRef.current) return;
        const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);
        setPosition({ x: x * 0.2, y: y * 0.2 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="relative z-10"
        >
            <Link
                href={href}
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50",
                    className
                )}
            >
                {/* Rotating Continuous Border */}
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />

                {/* Button Inner Content */}
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/90 px-8 py-4 text-base font-bold text-white backdrop-blur-3xl transition-all duration-300 group-hover:bg-slate-950/50">
                    <div className="relative flex items-center gap-2">
                        {children}

                        {/* Inner Shiny Layer */}
                        <div className="absolute inset-0 z-[-1] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary to-primary/20 blur-xl scale-150" />
                        </div>
                    </div>
                </span>

                {/* Outer Glow Shadow */}
                <div className="absolute -inset-1 z-[-1] rounded-full bg-primary/20 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" />
            </Link>
        </motion.div>
    );
}
