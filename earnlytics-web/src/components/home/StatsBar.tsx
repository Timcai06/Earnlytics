"use client";

import { useEffect, useState } from "react";
import { BotIcon, TrendingUpIcon, ClockIcon, ZapIcon } from "lucide-react";

interface StatItem {
    label: string;
    value: number;
    suffix?: string;
    icon: React.ReactNode;
}

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    duration?: number;
}

function AnimatedCounter({ value, suffix = "", duration = 2000 }: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeOut * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [value, duration]);

    return (
        <span>
            {displayValue}
            {suffix}
        </span>
    );
}

const stats: StatItem[] = [
    {
        label: "覆盖公司",
        value: 30,
        suffix: "+",
        icon: <TrendingUpIcon className="h-5 w-5" />,
    },
    {
        label: "已分析财报",
        value: 109,
        suffix: "+",
        icon: <BotIcon className="h-5 w-5" />,
    },
    {
        label: "分析速度",
        value: 1,
        suffix: "小时",
        icon: <ClockIcon className="h-5 w-5" />,
    },
    {
        label: "完全免费",
        value: 100,
        suffix: "%",
        icon: <ZapIcon className="h-5 w-5" />,
    },
];

export default function StatsBar() {
    return (
        <div className="w-full py-8">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-surface/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-surface/70 animate-fade-in-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary transition-transform duration-300 group-hover:scale-110">
                                    {stat.icon}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white tabular-nums">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                    </span>
                                </div>
                                <span className="mt-1 text-sm text-text-secondary">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
