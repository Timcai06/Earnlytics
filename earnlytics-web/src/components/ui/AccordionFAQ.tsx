"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

function FAQItem({ question, answer, isOpen, onClick, index }: FAQItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                "group mb-4 overflow-hidden rounded-2xl border transition-all duration-300",
                isOpen
                    ? "border-primary/50 bg-surface-elevated/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    : "border-white/5 bg-surface-secondary/30 hover:border-white/20"
            )}
        >
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <span className={cn(
                    "text-lg font-semibold transition-colors duration-300",
                    isOpen ? "text-white" : "text-text-secondary group-hover:text-white"
                )}>
                    {question}
                </span>
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                    isOpen ? "bg-primary text-white" : "bg-white/5 text-text-tertiary"
                )}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="border-t border-white/5 p-6 pt-0 text-text-secondary leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AccordionFAQ({
    items
}: {
    items: { q: string; a: string }[]
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="w-full">
            {items.map((item, index) => (
                <FAQItem
                    key={index}
                    index={index}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === index}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
            ))}
        </div>
    );
}
