"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
    borderColor?: string;
}

export default function FeatureCard({
    icon,
    title,
    description,
    className,
    borderColor = "border-primary/20",
}: FeatureCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    // Motion values for tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;

        x.set(xPct);
        y.set(yPct);
        setMouseX(mouseXPos);
        setMouseY(mouseYPos);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "group relative flex flex-col gap-4 rounded-2xl border bg-surface-secondary p-8 transition-colors duration-500 hover:bg-surface-elevated/50",
                borderColor,
                className
            )}
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
                }}
            />

            {/* Floating Icon Container */}
            <div
                style={{ transform: "translateZ(50px)" }}
                className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-surface shadow-inner ring-1 ring-white/10"
            >
                <div className="transition-transform duration-500 group-hover:scale-110">
                    {icon}
                </div>
            </div>

            <h3
                style={{ transform: "translateZ(40px)" }}
                className="text-2xl font-bold text-white"
            >
                {title}
            </h3>

            <p
                style={{ transform: "translateZ(30px)" }}
                className="text-base leading-relaxed text-text-secondary"
            >
                {description}
            </p>

            {/* Subtle Bottom Glow */}
            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover:scale-x-100" />
        </motion.div>
    );
}
