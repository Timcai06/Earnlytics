"use client";

import { useEffect, useCallback, useRef, useState } from "react";

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export function usePerformanceMonitoring() {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        metricsRef.current.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
      return observer;
    };

    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as PerformanceEntry & {
          processingStart?: number;
          startTime?: number;
        };
        if (firstEntry.processingStart && firstEntry.startTime) {
          metricsRef.current.fid =
            firstEntry.processingStart - firstEntry.startTime;
        }
      });
      observer.observe({ entryTypes: ["first-input"] });
      return observer;
    };

    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value;
          }
        }
        metricsRef.current.cls = clsValue;
      });
      observer.observe({ entryTypes: ["layout-shift"] });
      return observer;
    };

    const getFCPAndTTFB = () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType(
        "paint"
      ) as PerformanceEntry[];

      if (navigation) {
        metricsRef.current.ttfb = navigation.responseStart - navigation.startTime;
      }

      const fcpEntry = paint.find((entry) => entry.name === "first-contentful-paint");
      if (fcpEntry) {
        metricsRef.current.fcp = fcpEntry.startTime;
      }
    };

    const lcpObserver = observeLCP();
    const fidObserver = observeFID();
    const clsObserver = observeCLS();
    getFCPAndTTFB();

    return () => {
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
    };
  }, []);

  const getMetrics = useCallback(() => metricsRef.current, []);

  return { getMetrics };
}

export function useLazyLoad<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}
