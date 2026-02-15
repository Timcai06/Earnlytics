"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Database, Activity, Zap, TrendingUp, Users, Globe } from "lucide-react";

interface StatItem {
    id: string;
    label: string;
    value: number;
    suffix: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    delay: number;
}

const stats: StatItem[] = [
    {
        id: "reports",
        label: "AI 分析报告",
        value: 2450,
        suffix: "+",
        icon: <Bot className="h-5 w-5" />,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        delay: 0,
    },
    {
        id: "companies",
        label: "覆盖科技巨头",
        value: 35,
        suffix: "+",
        icon: <Globe className="h-5 w-5" />,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        delay: 0.1,
    },
    {
        id: "updates",
        label: "每日数据更新",
        value: 15000,
        suffix: "+",
        icon: <Database className="h-5 w-5" />,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        delay: 0.2,
    },
    {
        id: "users",
        label: "活跃投资者",
        value: 890,
        suffix: "+",
        icon: <Users className="h-5 w-5" />,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        delay: 0.3,
    },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, interval);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

export default function HeroStats() {
    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: stat.delay }}
                        className="relative group cursor-default"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        {/* Glow Effect on Hover */}
                        <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${stat.color.replace('text-', 'from-')} to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-20`} />

                        <div className="relative flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl border border-white/5 bg-surface/40 backdrop-blur-md shadow-xl transition-all duration-300 group-hover:border-white/10 group-hover:bg-surface/60">

                            {/* Icon Container */}
                            <div className={`mb-3 p-3 rounded-xl ${stat.bgColor} ${stat.color} ring-1 ring-inset ring-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                {stat.icon}
                            </div>

                            {/* Value */}
                            <div className="flex items-baseline gap-0.5 text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 tabular-nums">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </div>

                            {/* Label */}
                            <div className="text-xs md:text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                                {stat.label}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
