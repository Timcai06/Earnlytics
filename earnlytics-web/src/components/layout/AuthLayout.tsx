"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ZapIcon, BotIcon, DiamondIcon } from "@/components/icons";

const features = [
    {
        icon: <ZapIcon className="h-5 w-5 text-primary" />,
        title: "极速分析",
        description: "财报发布后1小时内完成AI分析",
    },
    {
        icon: <BotIcon className="h-5 w-5 text-success" />,
        title: "AI 智能解读",
        description: "复杂数据转化为通俗中文摘要",
    },
    {
        icon: <DiamondIcon className="h-5 w-5 text-info" />,
        title: "完全免费",
        description: "基础功能永久免费，无需注册",
    },
];

const stats = [
    { value: "30+", label: "覆盖公司" },
    { value: "1h", label: "分析速度" },
    { value: "100%", label: "免费" },
];

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex min-h-[calc(100vh-64px)] w-full">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-center overflow-hidden bg-surface p-10 xl:p-14">
                {/* Background Glow Effects */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-primary/[0.07] blur-[100px]" />
                    <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-info/[0.05] blur-[80px]" />
                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(var(--color-neutral-500) 1px, transparent 1px), linear-gradient(90deg, var(--color-neutral-500) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                {/* Top: Brand + Value Prop */}
                <div className="relative z-10 space-y-10">
                    <div>
                        <Link href="/" className="mb-12 inline-flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-[var(--shadow-toggle-button)]">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">Earnlytics</span>
                        </Link>

                        <h2
                            className={`mb-4 text-3xl font-bold leading-tight text-white xl:text-4xl transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                }`}
                        >
                            让财报分析
                            <br />
                            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                                变得简单
                            </span>
                        </h2>
                        <p
                            className={`mb-10 max-w-md text-base leading-relaxed text-text-secondary transition-all duration-700 delay-100 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                }`}
                        >
                            通过 AI 自动分析美国科技公司财报，
                            <br />
                            快速获取深度洞察与投资建议。
                        </p>

                        {/* Features */}
                        <div className="space-y-5">
                            {features.map((feature, i) => (
                                <div
                                    key={feature.title}
                                    className={`flex items-start gap-4 transition-all duration-500 ${mounted ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                                        }`}
                                    style={{ transitionDelay: `${200 + i * 100}ms` }}
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                                        <p className="text-sm text-text-tertiary">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div
                        className={`relative z-10 flex items-center gap-8 transition-all duration-700 delay-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col">
                                <span className="text-2xl font-bold text-primary-hover">{stat.value}</span>
                                <span className="text-xs text-text-tertiary">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 sm:px-10">
                <div
                    className={`w-full max-w-[440px] transition-all duration-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                        }`}
                >
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
                        <p className="text-base text-text-secondary">{subtitle}</p>
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
