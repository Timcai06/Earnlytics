"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroTitleProps {
    className?: string;
}

export default function HeroTitle({ className }: HeroTitleProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse parallax effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

    const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn("relative flex flex-col items-center py-10 perspective-1000", className)}
        >
            {/* Background Decorative Text */}
            <motion.div
                style={{
                    x: useTransform(springX, [-0.5, 0.5], ["-20px", "20px"]),
                    y: useTransform(springY, [-0.5, 0.5], ["-20px", "20px"]),
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[100px] font-black tracking-tighter text-white/[0.03] sm:text-[150px] lg:text-[180px]"
            >
                ANALYSIS
            </motion.div>

            {/* Main Title Group */}
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative z-10 flex flex-col items-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative inline-block"
                >
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

                    {/* Shooting light animation */}
                    <motion.div
                        animate={{
                            left: ["-100%", "200%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 5,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/2 h-[2px] w-40 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm"
                    />
                </motion.div>

                {/* Decorative Lines */}
                <div className="mt-8 flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary">
                        AI-POWERED INSIGHTS
                    </span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
                </div>
            </motion.div>

            {/* Floating Particles Around Title */}
            <div className="absolute inset-x-0 h-full overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute h-1 w-1 rounded-full bg-primary/40"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 20}%`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
