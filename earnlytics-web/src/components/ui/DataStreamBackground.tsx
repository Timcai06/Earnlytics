"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DataStreamBackgroundProps {
    className?: string;
    symbolCount?: number;
    speed?: number;
    opacity?: number;
}

interface StreamParticle {
    x: number;
    y: number;
    text: string;
    velocity: number;
    size: number;
}

function randomFrom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function createParticle(x: number, width: number, height: number, symbols: string[], speed: number): StreamParticle {
    return {
        x,
        y: Math.random() * height * -1,
        text: randomFrom(symbols),
        velocity: (Math.random() * 1.5 + 0.5) * speed,
        size: Math.floor(Math.random() * 10) + 12,
    };
}

function updateParticle(
    particle: StreamParticle,
    width: number,
    height: number,
    symbols: string[],
    speed: number
) {
    particle.y += particle.velocity;
    if (particle.y > height) {
        particle.y = -20;
        particle.x = Math.floor(Math.random() * width);
        particle.text = randomFrom(symbols);
        particle.velocity = (Math.random() * 1.5 + 0.5) * speed;
    }
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: StreamParticle) {
    ctx.font = `${particle.size}px monospace`;
    ctx.fillStyle = "#4ade80";
    ctx.fillText(particle.text, particle.x, particle.y);
}

export default function DataStreamBackground({
    className,
    symbolCount = 30, // Number of columns
    speed = 1,
    opacity = 0.15,
}: DataStreamBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: StreamParticle[] = [];

        // Financial symbols and data to display
        const symbols = [
            "AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "META",
            "$120.50", "+1.2%", "EPS $2.15", "REV $85B", "🟢", "▲", "▼",
            "AI", "BULL", "BEAT", "MISS", "Q1", "Q2", "Q3", "Q4"
        ];

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight; // Full screen or section height? 
            // Ideally this component fills its parent.
            // If parent is relative, canvas is absolute inset-0.
            // We need to handle resize.

            const columnWidth = canvas.width / symbolCount;
            particles = [];
            for (let i = 0; i < symbolCount; i++) {
                // Distribute roughly across width
                const x = i * columnWidth + Math.random() * columnWidth;
                particles.push(createParticle(x, canvas.width, canvas.height, symbols, speed));
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                updateParticle(p, canvas.width, canvas.height, symbols, speed);
                drawParticle(ctx, p);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight; // Or parent height
            // Re-init particles to cover new width? 
            // Or just keep existing? Let's just update bounds.
            // A full re-init is safer to prevent clumping.
            init();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, [symbolCount, speed]);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                "pointer-events-none absolute inset-0 z-0 h-full w-full",
                className
            )}
            style={{ opacity }}
        />
    );
}
