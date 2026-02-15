"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface TimelineEvent {
    id: number;
    date: string;
    symbol: string;
    companyName: string;
    fiscalYear: number;
    fiscalQuarter: number;
}

interface CalendarTimelineProps {
    events: TimelineEvent[];
}

export default function CalendarTimeline({ events }: CalendarTimelineProps) {
    const [today, setToday] = useState<string>("");

    useEffect(() => {
        setToday(new Date().toISOString().split('T')[0]);
    }, []);

    return (
        <div className="rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-md p-6">

            <div className="relative border-l border-white/10 ml-2 space-y-6">
                {events.length === 0 ? (
                    <div className="pl-6 py-4 text-sm text-text-tertiary">
                        近期暂无财报发布
                    </div>
                ) : (
                    events.map((event) => {
                        const isToday = today && event.date === today;
                        const dateObj = new Date(event.date);
                        const displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

                        return (
                            <div key={event.id} className="relative pl-6">
                                {/* Timeline Dot */}
                                <div
                                    className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background transition-all ${isToday ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110" : "bg-text-tertiary/30"
                                        }`}
                                />

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-mono font-medium ${isToday ? "text-primary" : "text-text-tertiary"}`}>
                                            {displayDate}
                                        </span>
                                        {isToday && (
                                            <span className="text-[10px] font-bold bg-primary/20 text-primary-hover px-1.5 rounded">
                                                TODAY
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-white text-sm">{event.companyName}</h4>
                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                        <span className="font-mono bg-white/5 px-1.5 rounded">{event.symbol}</span>
                                        <span>Q{event.fiscalQuarter} FY{event.fiscalYear}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div >
    );
}
