"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function TopLoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const routeKey = `${pathname}?${searchParams.toString()}`;

    return (
        <motion.div
            key={routeKey}
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "100%", opacity: 0 }}
            transition={{
                width: { duration: 0.6, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.4 }
            }}
            className="fixed top-0 left-0 z-[110] h-0.5 w-full bg-gradient-to-r from-primary/20 via-primary to-primary-hover shadow-[0_0_8px_rgba(99,102,241,0.6)] pointer-events-none"
        />
    );
}
