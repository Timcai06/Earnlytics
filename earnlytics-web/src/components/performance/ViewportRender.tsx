"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ViewportRenderProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

export function ViewportRender({
  children,
  fallback = null,
  rootMargin = "200px 0px",
  threshold = 0.01,
  once = true,
}: ViewportRenderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (isVisible && once) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        if (once) observer.disconnect();
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible, once, rootMargin, threshold]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}

