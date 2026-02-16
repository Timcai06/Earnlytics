"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DataStreamBackgroundProps {
    className?: string;
    symbolCount?: number;
    speed?: number;
    opacity?: number;
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
        let particles: Particle[] = [];

        // Financial symbols and data to display
        const symbols = [
            "AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "META",
            "$120.50", "+1.2%", "EPS $2.15", "REV $85B", "🟢", "▲", "▼",
            "AI", "BULL", "BEAT", "MISS", "Q1", "Q2", "Q3", "Q4"
        ];

        class Particle {
            x: number;
            y: number;
            text: string;
            velocity: number;
            size: number;
            // opacity: number;

            constructor(x: number) {
                this.x = x;
                this.y = Math.random() * canvas!.height * -1; // Start above canvas
                this.text = symbols[Math.floor(Math.random() * symbols.length)];
                this.velocity = (Math.random() * 1.5 + 0.5) * speed;
                this.size = Math.floor(Math.random() * 10) + 12; // 12-22px
                // this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                this.y += this.velocity;
                if (this.y > canvas!.height) {
                    this.y = -20;
                    this.x = Math.floor(Math.random() * canvas!.width);
                    this.text = symbols[Math.floor(Math.random() * symbols.length)];
                    this.velocity = (Math.random() * 1.5 + 0.5) * speed;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.font = `${this.size}px monospace`;

                // Greenish/Cyan tint for futuristic financial look
                // We use globalAlpha for the whole canvas, but we can also set fillStyle alpha
                // ctx.fillStyle = `rgba(0, 255, 128, ${this.opacity})`; 

                // Using a gradient or solid color based on theme would be cool, 
                // but let's stick to a subtle text color that blends with dark mode
                ctx.fillStyle = "#4ade80"; // tailwind green-400
                ctx.fillText(this.text, this.x, this.y);
            }
        }

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
                particles.push(new Particle(x));
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.update();
                p.draw();
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
