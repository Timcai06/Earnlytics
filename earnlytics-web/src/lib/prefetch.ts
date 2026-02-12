"use client";

import { useEffect, useCallback } from "react";

interface PrefetchOptions {
  priority?: "high" | "low";
  cacheDuration?: number;
}

const prefetchCache = new Map<string, number>();
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

export function usePrefetch() {
  const prefetch = useCallback((url: string, options: PrefetchOptions = {}) => {
    const { cacheDuration = DEFAULT_CACHE_DURATION } = options;
    const now = Date.now();
    const cached = prefetchCache.get(url);
    
    if (cached && now - cached < cacheDuration) {
      return;
    }

    if (typeof window !== "undefined" && "fetch" in window) {
      fetch(url, { method: "HEAD" })
        .then(() => {
          prefetchCache.set(url, now);
        })
        .catch(() => {});
    }
  }, []);

  const prefetchMultiple = useCallback((urls: string[], options: PrefetchOptions = {}) => {
    urls.forEach((url, index) => {
      setTimeout(() => prefetch(url, options), index * 100);
    });
  }, [prefetch]);

  return { prefetch, prefetchMultiple };
}

export function usePrefetchOnVisible(urls: string[], options: PrefetchOptions = {}) {
  const { prefetchMultiple } = usePrefetch();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchMultiple(urls, options);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("prefetch-trigger");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [urls, prefetchMultiple, options]);
}

export function prefetchCompanyData(symbol: string) {
  const urls = [
    `/api/analysis/${symbol}/investment`,
    `/api/valuation/${symbol}`,
    `/api/peers/${symbol}`,
  ];

  urls.forEach((url, index) => {
    setTimeout(() => {
      if (typeof window !== "undefined") {
        fetch(url, { method: "HEAD" }).catch(() => {});
      }
    }, index * 50);
  });
}
