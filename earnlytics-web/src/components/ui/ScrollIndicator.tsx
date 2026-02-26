"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
    className?: string;
    targetId?: string;
}

export default function ScrollIndicator({ className, targetId }: ScrollIndicatorProps) {
    const scrollToNext = () => {
        if (targetId) {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <div
            className={cn(
                "absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer transition-opacity duration-300 hover:opacity-100 opacity-60",
                className
            )}
            onClick={scrollToNext}
        >
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-widest text-text-tertiary">Discover More</span>
                <ChevronDown className="h-6 w-6 animate-bounce text-primary" />
            </div>
        </div>
    );
}
