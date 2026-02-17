"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopLoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Start loading on pathname/searchParams change
        setLoading(true);

        // Simulate completion (Next.js 13 router events are limited, 
        // but this visual feedback is still valuable)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ width: "0%", opacity: 1 }}
                    animate={{ width: "70%", opacity: 1 }}
                    exit={{ width: "100%", opacity: 0 }}
                    transition={{
                        width: { duration: 0.4, ease: "easeOut" },
                        opacity: { duration: 0.2, delay: 0.3 }
                    }}
                    className="fixed top-0 left-0 z-[110] h-0.5 w-full bg-gradient-to-r from-primary/20 via-primary to-primary-hover shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                />
            )}
        </AnimatePresence>
    );
}
