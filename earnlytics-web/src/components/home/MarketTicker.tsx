"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TickerItem {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
}

function SkeletonItem() {
    return (
        <div className="flex shrink-0 items-center gap-2 px-6">
            <div className="h-4 w-12 animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-14 animate-pulse rounded bg-surface-secondary" />
        </div>
    );
}

function TickerItemDisplay({ item }: { item: TickerItem }) {
    return (
        <div className="flex shrink-0 items-center gap-2 px-6">
            <span className="font-semibold text-text-secondary">{item.symbol}</span>
            <span className="font-mono text-white">${(item.price ?? 0).toFixed(2)}</span>
            <div className={`flex items-center gap-1 text-xs font-medium ${item.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {item.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                ) : (
                    <TrendingDown className="h-3 w-3" />
                )}
                {item.isPositive ? "+" : ""}{(item.changePercent ?? 0).toFixed(2)}%
            </div>
        </div>
    );
}

const FALLBACK_TICKER: TickerItem[] = [
    { symbol: "AAPL", price: 245.50, change: 1.25, changePercent: 0.51, isPositive: true },
    { symbol: "NVDA", price: 180.20, change: -0.45, changePercent: -0.25, isPositive: false },
    { symbol: "MSFT", price: 410.15, change: 2.10, changePercent: 0.51, isPositive: true },
    { symbol: "TSLA", price: 420.00, change: 5.50, changePercent: 1.33, isPositive: true },
    { symbol: "GOOGL", price: 175.30, change: -1.20, changePercent: -0.68, isPositive: false },
    { symbol: "AMZN", price: 195.80, change: 0.90, changePercent: 0.46, isPositive: true },
    { symbol: "AMD", price: 210.45, change: 3.10, changePercent: 1.50, isPositive: true },
    { symbol: "META", price: 580.60, change: -2.30, changePercent: -0.39, isPositive: false },
    { symbol: "INTC", price: 45.20, change: 0.15, changePercent: 0.33, isPositive: true },
    { symbol: "NFLX", price: 685.90, change: 8.40, changePercent: 1.24, isPositive: true },
];

export default function MarketTicker() {
    const [tickerData, setTickerData] = useState<TickerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [setWidth, setSetWidth] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const measureRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchTickerData() {
            try {
                const res = await fetch("/api/market-ticker");
                if (!res.ok) {
                    setIsLoading(false);
                    return;
                }
                const data: TickerItem[] = await res.json();
                if (data && data.length > 0) {
                    setTickerData(data);
                }
            } catch (e) {
                console.error("Failed to fetch ticker data:", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTickerData();
    }, []);

    useEffect(() => {
        if (!measureRef.current) return;

        const measureContent = () => {
            if (measureRef.current) {
                setSetWidth(measureRef.current.scrollWidth);
            }
        };

        measureContent();

        const observer = new ResizeObserver(measureContent);
        observer.observe(measureRef.current);

        return () => observer.disconnect();
    }, [tickerData, isLoading]);

    useEffect(() => {
        if (!containerRef.current) return;

        const node = containerRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const canAnimate = entry.isIntersecting && !document.hidden;
                setIsAnimating(canAnimate);
            },
            { threshold: 0.1 }
        );
        observer.observe(node);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsAnimating(false);
                return;
            }
            const rect = node.getBoundingClientRect();
            const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
            setIsAnimating(inViewport);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const mergedData = FALLBACK_TICKER.map(fallbackItem => {
        const apiItem = tickerData.find(item => item.symbol === fallbackItem.symbol);
        // Use API item if it exists and has valid-looking data (non-zero price and change)
        // Note: Change can technically be 0, but it's rare for these major stocks. 
        // We prioritize the fallback if change is 0 to avoid "stale/broken" look, 
        // assuming fallback data is a better "demo" experience than 0.00 change.
        if (apiItem && apiItem.price > 0 && (apiItem.change !== 0 || apiItem.changePercent !== 0)) {
            return apiItem;
        }
        return fallbackItem;
    });

    // Repeat data enough times to ensure it covers reasonably wide screens without gaps
    // 3 repetitions of the base list (10 items) should be plenty (~30 items)
    const displayData = [...mergedData, ...mergedData, ...mergedData];

    const speed = 50; // pixels per second
    const duration = setWidth > 0 ? setWidth / speed : 60;

    return (
        <div ref={containerRef} className="w-full overflow-hidden border-b border-white/5 bg-background/50 backdrop-blur-sm">
            <div className="relative flex py-3">
                <div
                    className="flex animate-marquee"
                    style={{
                        animationDuration: `${duration}s`,
                        animationPlayState: setWidth > 0 && isAnimating ? "running" : "paused",
                    }}
                >
                    <div ref={measureRef} className="flex shrink-0">
                        {isLoading && tickerData.length === 0 ? (
                            <>
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <SkeletonItem key={i} />
                                ))}
                            </>
                        ) : (
                            displayData.map((item, index) => (
                                <TickerItemDisplay key={`${item.symbol}-${index}`} item={item} />
                            ))
                        )}
                    </div>
                    <div className="flex shrink-0" aria-hidden="true">
                        {isLoading && tickerData.length === 0 ? (
                            <>
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <SkeletonItem key={`dup-${i}`} />
                                ))}
                            </>
                        ) : (
                            displayData.map((item, index) => (
                                <TickerItemDisplay key={`${item.symbol}-dup-${index}`} item={item} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
