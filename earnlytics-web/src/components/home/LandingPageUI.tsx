"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ZapIcon, BotIcon, DiamondIcon, AppleIcon, WindowIcon, SearchIcon, CpuIcon, MetaIcon } from "@/components/icons";
import MysticalGlow from "@/components/ui/mystical-glow";
import DataStreamBackground from "@/components/ui/data-stream-background";
import FlipCard from "@/components/ui/flip-card";
import ScrollIndicator from "@/components/ui/scroll-indicator";
import FeatureCard from "@/components/ui/feature-card";
import StepCard from "@/components/ui/step-card";
import AccordionFAQ from "@/components/ui/accordion-faq";
import GlowingButton from "@/components/ui/glowing-button";
import SciFiStatCard from "@/components/ui/stat-card";
import HeroTitle from "@/components/ui/hero-title";
import AnalysisPreview from "@/components/ui/analysis-preview";

const steps = [
    { step: 1, title: "选择公司", desc: "从30+科技公司中选择感兴趣的目标" },
    { step: 2, title: "查看财报", desc: "实时获取最新财报数据和历史趋势" },
    { step: 3, title: "AI分析", desc: "1小时内获得专业AI分析报告" }
];

const faqs = [
    {
        q: "Earnlytics真的免费吗？",
        a: "是的，基础功能永久免费，无需注册即可使用所有核心功能。"
    },
    {
        q: "AI分析的准确性如何？",
        a: "我们的AI模型经过大量财报数据训练，能够准确提取关键财务指标和趋势。"
    },
    {
        q: "支持哪些公司？",
        a: "当前覆盖Apple、Microsoft、Google、NVIDIA、Meta等30+家主流科技公司。"
    },
    {
        q: "数据更新频率是多少？",
        a: "财报发布后1小时内即可获得AI分析结果，数据与官方同步。"
    }
];

export default function LandingPageUI() {
    const heroRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
    };
    const features = [
        {
            icon: <ZapIcon className="h-10 w-10 text-primary" />,
            title: "极速分析",
            description: "财报发布后1小时内完成AI分析，快速把握投资机会",
            borderColor: "border-primary",
            shadowColor: "shadow-[var(--shadow-card-primary)]",
        },
        {
            icon: <BotIcon className="h-10 w-10 text-success" />,
            title: "AI 智能解读",
            description: "复杂财务数据转化为通俗易懂的中文摘要",
            borderColor: "border-success",
            shadowColor: "shadow-[var(--shadow-focus-success)]",
        },
        {
            icon: <DiamondIcon className="h-10 w-10 text-info" />,
            title: "完全免费",
            description: "基础功能永久免费，无需注册即可访问",
            borderColor: "border-info",
            shadowColor: "shadow-[var(--shadow-card-primary)]",
        },
    ];

    const stats = [
        { value: "30+", label: "覆盖公司" },
        { value: "1小时", label: "分析速度" },
        { value: "100%", label: "免费访问" },
    ];

    const companies = [
        {
            icon: <AppleIcon className="h-12 w-12" />,
            name: "Apple",
            border: "border-border",
            data: { price: "$182.50", change: "+1.2%", sentiment: "🟢 积极", eps: "$2.18", rev: "$120B" }
        },
        {
            icon: <WindowIcon className="h-12 w-12" />,
            name: "Microsoft",
            border: "border-info",
            data: { price: "$405.00", change: "+0.8%", sentiment: "🟢 积极", eps: "$2.93", rev: "$62B" }
        },
        {
            icon: <SearchIcon className="h-12 w-12" />,
            name: "Google",
            border: "border-success",
            data: { price: "$145.00", change: "-0.5%", sentiment: "🟡 中性", eps: "$1.64", rev: "$86B" }
        },
        {
            icon: <CpuIcon className="h-12 w-12 text-success" />,
            name: "NVIDIA",
            border: "border-success",
            data: { price: "$720.00", change: "+3.5%", sentiment: "🟢 强推", eps: "$5.16", rev: "$22B" }
        },
        {
            icon: <MetaIcon className="h-12 w-12" />,
            name: "Meta",
            border: "border-primary",
            data: { price: "$460.00", change: "+2.1%", sentiment: "🟢 积极", eps: "$5.33", rev: "$40B" }
        },
    ];

    return (
        <div className="h-[calc(100vh-87px)] overflow-y-auto snap-y snap-mandatory scroll-smooth">
            {/* Hero Section */}
            <section
                id="hero"
                ref={heroRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-background px-4"
            >
                <MysticalGlow mousePosition={mousePos} />
                <DataStreamBackground className="opacity-20" />
                <div className="relative z-10 flex flex-col items-center text-center w-full max-w-7xl">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 inline-flex items-center gap-2 rounded-2xl bg-primary-light px-4 py-2"
                    >
                        <BotIcon className="h-4 w-4 text-primary-hover" />
                        <span className="text-sm font-semibold text-primary-hover">
                            AI 驱动的财报分析
                        </span>
                    </motion.div>

                    {/* Title */}
                    <HeroTitle className="mb-4" />

                    {/* Subtitle */}
                    <p className="mb-10 max-w-2xl text-lg text-text-secondary">
                        通过 AI 自动分析美国科技公司财报，1小时内获取深度洞察
                    </p>

                    <div className="mb-16 flex flex-col items-center gap-4">
                        <GlowingButton href="/home">
                            免费开始分析
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </GlowingButton>
                        <span className="flex items-center gap-2 text-sm text-text-secondary">
                            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            无需注册 · 永久免费
                        </span>
                    </div>

                    {/* Floating HUD Orbital Stats (Desktop Only) */}
                    <div className="hidden lg:block pointer-events-none">
                        {/* Stat 1: Left-Top */}
                        <motion.div
                            style={{
                                x: mousePos.x * -40,
                                y: mousePos.y * -40
                            }}
                            animate={{
                                rotate: [0, 2, 0, -2, 0],
                                scale: [1.1, 1.12, 1.1]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute left-[5%] top-[20%] z-20"
                        >
                            <SciFiStatCard
                                label={stats[0].label}
                                value={stats[0].value}
                                className="opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </motion.div>

                        {/* Stat 2: Right-Top/Middle */}
                        <motion.div
                            style={{
                                x: mousePos.x * 50,
                                y: mousePos.y * 50
                            }}
                            animate={{
                                rotate: [0, -3, 0, 3, 0],
                                scale: [1.1, 1.08, 1.1]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
                            className="absolute right-[8%] top-[30%] z-20"
                        >
                            <SciFiStatCard
                                label={stats[1].label}
                                value={stats[1].value}
                                className="opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </motion.div>

                        {/* Stat 3: Bottom-Left Area */}
                        <motion.div
                            style={{
                                x: mousePos.x * -30,
                                y: mousePos.y * 60
                            }}
                            animate={{
                                rotate: [0, 1, 0, -1, 0],
                                scale: [1.05, 1.07, 1.05]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 0.5 }}
                            className="absolute left-[12%] bottom-[18%] z-20"
                        >
                            <SciFiStatCard
                                label={stats[2].label}
                                value={stats[2].value}
                                className="opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </motion.div>
                    </div>

                    {/* Standard Stats (Mobile Only) */}
                    <div className="flex lg:hidden flex-wrap justify-center items-center gap-8 border-t border-white/5 pt-12">
                        {stats.map((stat) => (
                            <SciFiStatCard
                                key={stat.label}
                                label={stat.label}
                                value={stat.value}
                            />
                        ))}
                    </div>
                </div>
                <ScrollIndicator targetId="features" />
            </section>

            {/* Features Section */}
            <section id="features" className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-surface px-4 py-12">
                {/* Background Decorations */}
                <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-success/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

                <div className="relative z-10 mx-auto max-w-6xl">
                    <div className="mb-16 flex flex-col items-center text-center">
                        <h2 className="mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                            为什么选择 Earnlytics
                        </h2>
                        <div className="h-1.5 w-20 rounded-full bg-primary" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {features.map((feature) => (
                            <FeatureCard
                                key={feature.title}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                borderColor={feature.borderColor}
                            />
                        ))}
                    </div>
                </div>
                <ScrollIndicator targetId="steps" />
            </section>

            <section id="steps" className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
                {/* Background Decorations */}
                <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
                <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-info/10 blur-[100px]" />

                <div className="relative z-10 mx-auto max-w-6xl">
                    <div className="mb-20 flex flex-col items-center text-center">
                        <h2 className="mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                            3步开始智能财报分析
                        </h2>
                        <div className="h-1.5 w-20 rounded-full bg-primary" />
                    </div>

                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        {steps.map((item) => (
                            <StepCard
                                key={item.step}
                                step={item.step}
                                title={item.title}
                                description={item.desc}
                            />
                        ))}
                    </div>
                </div>
                <ScrollIndicator targetId="preview" />
            </section>

            {/* Product Preview Section */}
            <section id="preview" className="relative h-[calc(100vh-87px)] snap-start flex flex-col items-center justify-center overflow-hidden bg-background">
                <AnalysisPreview />
                <ScrollIndicator targetId="companies" />
            </section>

            {/* Companies Showcase */}
            <section id="companies" className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
                {/* Background Decorations */}
                <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
                <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-success/10 blur-[100px]" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-12 flex flex-col items-center text-center">
                        <h2 className="mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                            覆盖热门科技公司
                        </h2>
                        <div className="h-1.5 w-20 rounded-full bg-primary" />
                    </div>
                    <p className="mb-12 max-w-2xl text-xl text-text-secondary">
                        追踪 Apple、Microsoft、NVIDIA 等 30+ 家科技巨头的财报动态
                    </p>

                    {/* Company Logos */}
                    {/* Company Logos with 3D Flip */}
                    <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                        {companies.map((company) => (
                            <FlipCard
                                key={company.name}
                                width="140px"
                                height="140px"
                                className="mx-auto"
                                front={
                                    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border ${company.border} bg-surface-secondary shadow-lg`}>
                                        {company.icon}
                                        <span className="font-semibold text-white">{company.name}</span>
                                    </div>
                                }
                                back={
                                    <div className={`flex h-full w-full flex-col items-center justify-between rounded-2xl border ${company.border} bg-surface-elevated p-4 shadow-xl`}>
                                        <div className="text-center">
                                            <div className="text-xs text-text-secondary">EPS / Revenue</div>
                                            <div className="font-mono text-sm font-bold text-white">{company.data.eps} / {company.data.rev}</div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-medium text-text-secondary">AI 情绪</span>
                                            <span className="text-sm font-bold text-white">{company.data.sentiment}</span>
                                        </div>
                                    </div>
                                }
                            />
                        ))}
                    </div>

                    <GlowingButton href="/companies">
                        查看全部 30+ 家公司
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </GlowingButton>
                </div>
                <ScrollIndicator targetId="faq" />
            </section>

            {/* FAQ Section */}
            <section id="faq" className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
                {/* Background Decorations */}
                <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
                <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-info/10 blur-[100px]" />

                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-24">
                    {/* Left Side: Title & Info */}
                    <div className="lg:col-span-5 flex flex-col justify-center">
                        <h2 className="mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                            常见问题
                        </h2>
                        <p className="mb-8 text-xl text-text-secondary leading-relaxed">
                            关于 Earnlytics，您可能想了解这些。如果没有找到您需要的答案，欢迎随时联系我们的支持团队。
                        </p>

                        <div className="flex items-center gap-4 text-primary font-medium group cursor-pointer">
                            <span className="border-b border-primary/20 pb-1 group-hover:border-primary transition-all">
                                联系技术支持
                            </span>
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>

                    {/* Right Side: Accordion */}
                    <div className="lg:col-span-7 flex items-center">
                        <AccordionFAQ items={faqs} />
                    </div>
                </div>
            </section>
        </div>
    );
}
