"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/companies?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Glow Effect */}
            <div
                className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-violet-500 to-primary opacity-30 blur-2xl transition-opacity duration-500 ${isFocused ? "opacity-60" : "opacity-30"
                    }`}
            />

            <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20 focus-within:border-primary/50 focus-within:bg-surface/90">
                    <div className="flex h-14 w-14 items-center justify-center text-text-secondary">
                        <SearchIcon className={`h-6 w-6 transition-colors ${isFocused ? "text-primary" : ""}`} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="搜索公司代码或名称 (例如: AAPL, Apple)"
                        className="h-14 w-full bg-transparent pr-6 text-lg text-white placeholder-text-tertiary focus:outline-none"
                    />
                    <div className="hidden sm:flex items-center pr-4">
                        <kbd className="hidden rounded border border-white/10 px-2 py-1 text-xs text-text-tertiary sm:inline-block">
                            Enter
                        </kbd>
                    </div>
                </div>
            </form>
        </div>
    );
}
