"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, FileText, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function AnalysisPreview() {
    return (
        <div className="relative mx-auto max-w-5xl px-4 py-24">
            {/* Background Glow for this section */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side: Text Content */}
                <div className="flex flex-col space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
                    >
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary-hover">AI 分析样张预览</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
                    >
                        不仅仅是数据，<br />
                        更是<span className="text-primary">深度洞察</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-text-secondary leading-relaxed"
                    >
                        Earnlytics 的 AI 引擎会自动解析长达数百页的财务报表，
                        并在 1 小时内提炼出真正影响股价的关键指标。
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {[
                            { icon: <TrendingUp className="h-5 w-5" />, text: "营收趋势精准预测" },
                            { icon: <ShieldCheck className="h-5 w-5" />, text: "风险因子自动扫描" },
                            { icon: <BarChart3 className="h-5 w-5" />, text: "同行业多维对标" },
                            { icon: <FileText className="h-5 w-5" />, text: "自然语言观点总结" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-text-secondary">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary text-primary">
                                    {item.icon}
                                </div>
                                <span className="text-sm">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right Side: Mock Report Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative perspective-1000 will-change-transform"
                >
                    {/* Main Report Card */}
                    <div className="relative rounded-2xl border border-white/10 bg-surface-secondary/80 p-6 shadow-2xl backdrop-blur-md ring-1 ring-white/10 overflow-hidden">
                        {/* Header Area */}
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">NVIDIA (NVDA)</h4>
                                    <p className="text-xs text-text-tertiary">2024 Q4 财报分析报告</p>
                                </div>
                            </div>
                            <div className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success border border-success/20">
                                AI 强推
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[
                                { label: "营收", value: "$22.1B", sub: "+265% YoY" },
                                { label: "EPS", value: "$5.16", sub: "+481% YoY" },
                                { label: "利润率", value: "76.7%", sub: "超预期" },
                            ].map((s, i) => (
                                <div key={i} className="rounded-xl bg-white/5 p-3 text-center">
                                    <div className="text-[10px] uppercase tracking-wider text-text-tertiary mb-1">{s.label}</div>
                                    <div className="font-mono text-sm font-bold text-white">{s.value}</div>
                                    <div className="text-[9px] text-success mt-1">{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* AI Observations */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-text-tertiary flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                AI 核心观察点
                            </h5>
                            {[
                                "数据中心业务营收创新高，由于 AI 芯片需求激增",
                                "毛利率从 63.3% 大幅提升至 76.7%，盈利能力极强",
                                "推理端需求正在从训练端全面爆发",
                            ].map((obs, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    key={i}
                                    className="flex items-start gap-3 rounded-lg bg-primary/5 p-3 border border-primary/10"
                                >
                                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span className="text-xs text-text-secondary leading-normal">{obs}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Scanning Line Animation - Optimized with Y transform */}
                        <motion.div
                            animate={{ y: ["0%", "450px", "0%"] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none will-change-transform"
                        />
                    </div>

                    {/* Floating Accent Elements */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none"
                    />
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-xl pointer-events-none"
                    />
                </motion.div>
            </div>
        </div>
    );
}
