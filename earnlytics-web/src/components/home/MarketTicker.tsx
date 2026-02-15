"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const MOCK_MARKET_DATA = [
    { symbol: "NASDAQ", value: "16,274.94", change: "+0.90%", isPositive: true },
    { symbol: "S&P 500", value: "5,117.09", change: "+0.74%", isPositive: true },
    { symbol: "DOW", value: "38,790.43", change: "+0.20%", isPositive: true },
    { symbol: "AAPL", value: "172.62", change: "+1.36%", isPositive: true },
    { symbol: "NVDA", value: "884.55", change: "+3.12%", isPositive: true },
    { symbol: "MSFT", value: "417.32", change: "+1.05%", isPositive: true },
    { symbol: "TSLA", value: "163.57", change: "-1.15%", isPositive: false },
    { symbol: "GOOGL", value: "148.48", change: "-0.50%", isPositive: false },
    { symbol: "META", value: "496.24", change: "+2.66%", isPositive: true },
    { symbol: "AMZN", value: "174.42", change: "+0.80%", isPositive: true },
];

// Duplicate data to create seamless loop
const TICKER_DATA = [...MOCK_MARKET_DATA, ...MOCK_MARKET_DATA];

export default function MarketTicker() {
    return (
        <div className="w-full overflow-hidden border-b border-white/5 bg-background/50 backdrop-blur-sm">
            <div className="flex whitespace-nowrap py-3">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                    className="flex gap-12 px-4"
                >
                    {TICKER_DATA.map((item, index) => (
                        <div key={`${item.symbol}-${index}`} className="flex items-center gap-2">
                            <span className="font-semibold text-text-secondary">{item.symbol}</span>
                            <span className="font-mono text-white">{item.value}</span>
                            <div className={`flex items-center gap-1 text-xs font-medium ${item.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                {item.isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {item.change}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
