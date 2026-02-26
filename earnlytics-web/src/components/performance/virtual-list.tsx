"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;

  const { virtualItems, startIndex } = useCallback(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIdx = Math.max(0, start - overscan);
    const endIdx = Math.min(items.length, start + visibleCount + overscan);

    return {
      virtualItems: items.slice(startIdx, endIdx),
      startIndex: startIdx,
      endIndex: endIdx,
    };
  }, [scrollTop, itemHeight, containerHeight, items, overscan])();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: "auto" }}
      className="virtual-list-container"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: "absolute",
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              left: 0,
              right: 0,
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}
