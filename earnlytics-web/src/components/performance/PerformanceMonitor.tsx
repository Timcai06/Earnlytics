"use client";

import { useEffect } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance";

export function PerformanceMonitor() {
  const { getMetrics } = usePerformanceMonitoring();

  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV !== "production") {
      return;
    }

    const sendMetrics = () => {
      const metrics = getMetrics();
      
      if (metrics.lcp && metrics.lcp > 2500) {
        console.warn("LCP exceeds 2.5s:", metrics.lcp);
      }
      
      if (metrics.fid && metrics.fid > 100) {
        console.warn("FID exceeds 100ms:", metrics.fid);
      }
      
      if (metrics.cls && metrics.cls > 0.1) {
        console.warn("CLS exceeds 0.1:", metrics.cls);
      }
    };

    const timeoutId = setTimeout(sendMetrics, 5000);

    return () => clearTimeout(timeoutId);
  }, [getMetrics]);

  return null;
}
