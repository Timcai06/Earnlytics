"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
    front: React.ReactNode;
    back: React.ReactNode;
    width?: string | number;
    height?: string | number;
}

export default function FlipCard({
    front,
    back,
    className,
    width = "100%",
    height = "200px", // Default height
    ...props
}: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className={cn("group perspective-1000 relative cursor-pointer", className)}
            style={{ width, height }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped(!isFlipped)} // For mobile
            {...props}
        >
            <div
                className={cn(
                    "relative h-full w-full transition-all duration-500 transform-style-3d",
                    isFlipped ? "rotate-y-180" : ""
                )}
            >
                {/* Front */}
                <div className="absolute inset-0 h-full w-full backface-hidden">
                    {front}
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full w-full rotate-y-180 backface-hidden bg-surface-secondary border border-border rounded-xl">
                    {back}
                </div>
            </div>
        </div>
    );
}
