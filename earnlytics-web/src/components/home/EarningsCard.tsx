"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface EarningsCardProps {
    companyName: string;
    ticker: string;
    quarter: string;
    fiscalYear: number;
    reportDate: string;
    revenue: string;
    revenueGrowth: number | null;
    eps: string;
    epsSurprise: number | null;
    logo: React.ReactNode;
    revenueHistory?: number[];
}

function generateSparklinePath(data: number[], width: number, height: number): string {
    if (!data || data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    const points = data.map((value, index) => ({
        x: (index / (data.length - 1)) * width,
        y: height - ((value - min) / range) * (height * 0.8) - height * 0.1,
    }));

    // Build a smooth curve through the points
    let path = `M${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        path += ` C${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
}

function EarningsCard({
    companyName,
    ticker,
    quarter,
    fiscalYear,
    reportDate,
    revenue,
    revenueGrowth,
    eps,
    epsSurprise,
    logo,
    revenueHistory,
}: EarningsCardProps) {
    const isPositiveGrowth = (revenueGrowth || 0) > 0;
    const isPositiveSurprise = (epsSurprise || 0) > 0;

    const sparklinePath = useMemo(
        () =>
            revenueHistory && revenueHistory.length >= 2
                ? generateSparklinePath(revenueHistory, 60, 20)
                : "",
        [revenueHistory]
    );

    return (
        <Link
            href={`/earnings/${ticker.toLowerCase()}`}
            prefetch={false}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-surface/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
        >
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary/80 text-white shadow-inner backdrop-blur-md">
                            {logo}
                        </div>
                        <div>
                            <h3 className="font-bold text-white group-hover:text-primary transition-colors">{companyName}</h3>
                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                                <span className="font-mono">{ticker}</span>
                                <span>•</span>
                                <span>Q{quarter} FY{fiscalYear}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-text-tertiary">{reportDate}</span>
                        {sparklinePath ? (
                            <svg width="60" height="20" viewBox="0 0 60 20" className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <path
                                    d={sparklinePath}
                                    fill="none"
                                    stroke={isPositiveGrowth ? "#34d399" : "#fb7185"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : null}
                    </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div>
                        <p className="text-xs text-text-tertiary mb-1">营收 (Revenue)</p>
                        <div className="flex items-end gap-2">
                            <span className="text-lg font-bold text-white tabular-nums">{revenue}</span>
                            {revenueGrowth !== null && (
                                <span className={`flex items-center text-xs font-medium ${isPositiveGrowth ? "text-emerald-400" : "text-rose-400"}`}>
                                    {isPositiveGrowth ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {Math.abs(revenueGrowth)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-text-tertiary mb-1">每股收益 (EPS)</p>
                        <div className="flex items-end gap-2">
                            <span className="text-lg font-bold text-white tabular-nums">{eps}</span>
                            {epsSurprise !== null && (
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositiveSurprise
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 text-rose-400"
                                    }`}>
                                    {isPositiveSurprise ? "+" : ""}{epsSurprise}% 惊喜
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function areEqual(prev: EarningsCardProps, next: EarningsCardProps) {
    return (
        prev.companyName === next.companyName &&
        prev.ticker === next.ticker &&
        prev.quarter === next.quarter &&
        prev.fiscalYear === next.fiscalYear &&
        prev.reportDate === next.reportDate &&
        prev.revenue === next.revenue &&
        prev.revenueGrowth === next.revenueGrowth &&
        prev.eps === next.eps &&
        prev.epsSurprise === next.epsSurprise &&
        prev.revenueHistory === next.revenueHistory
    );
}

export default memo(EarningsCard, areEqual);
