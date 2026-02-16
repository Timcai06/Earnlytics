"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepCardProps {
    step: number;
    title: string;
    description: string;
    className?: string;
}

export default function StepCard({
    step,
    title,
    description,
    className,
}: StepCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;
        x.set(mouseXPos / rect.width - 0.5);
        y.set(mouseYPos / rect.height - 0.5);
        setMouseX(mouseXPos);
        setMouseY(mouseYPos);
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={cn(
                "group relative flex flex-col items-center text-center gap-4 rounded-3xl border border-white/10 bg-surface-secondary/50 p-10 transition-all duration-500 hover:bg-surface-elevated/40 hover:border-primary/30",
                className
            )}
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.1), transparent 80%)`,
                }}
            />

            {/* Step Number Badge */}
            <div
                style={{ transform: "translateZ(60px)" }}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-2xl font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
                {step}
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            </div>

            <h3
                style={{ transform: "translateZ(40px)" }}
                className="mt-4 text-2xl font-bold text-white transition-colors group-hover:text-primary-hover"
            >
                {title}
            </h3>

            <p
                style={{ transform: "translateZ(20px)" }}
                className="max-w-xs text-base text-text-secondary leading-relaxed"
            >
                {description}
            </p>

            {/* Background Large Number Reveal */}
            <div
                className="pointer-events-none absolute -bottom-4 -right-2 select-none text-8xl font-black text-white/[0.03] transition-colors group-hover:text-primary/[0.05]"
            >
                0{step}
            </div>
        </motion.div>
    );
}
