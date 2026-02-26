"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  delayDuration?: number;
  maxWidth?: number;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  maxWidth = 250,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [positionStyles, setPositionStyles] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setIsMounted(true);
    }, delayDuration);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const calculatePositionStyles = useCallback((): React.CSSProperties => {
    if (!triggerRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const tooltipWidth = tooltipRect?.width || 0;
    const tooltipHeight = tooltipRect?.height || 0;

    let top = 0;
    let left = 0;

    switch (side) {
      case "top":
        top = triggerRect.top - tooltipHeight - 8;
        break;
      case "bottom":
        top = triggerRect.bottom + 8;
        break;
      case "left":
        left = triggerRect.left - tooltipWidth - 8;
        break;
      case "right":
        left = triggerRect.right + 8;
        break;
    }

    if (side === "top" || side === "bottom") {
      switch (align) {
        case "start":
          left = triggerRect.left;
          break;
        case "center":
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
          break;
        case "end":
          left = triggerRect.right - tooltipWidth;
          break;
      }
    }

    if (side === "left" || side === "right") {
      switch (align) {
        case "start":
          top = triggerRect.top;
          break;
        case "center":
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
          break;
        case "end":
          top = triggerRect.bottom - tooltipHeight;
          break;
      }
    }

    return { top, left };
  }, [side, align]);

  useEffect(() => {
    if (!isMounted) return;

    const updatePosition = () => {
      setPositionStyles(calculatePositionStyles());
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isMounted, calculatePositionStyles]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>
      {isMounted && (
        <div
          ref={tooltipRef}
          style={{
            ...positionStyles,
            maxWidth,
          }}
          className={cn(
            "fixed z-50 px-3 py-2 rounded-lg text-sm",
            "bg-surface-secondary border border-border text-white",
            "shadow-lg",
            "transition-all duration-200 ease-out",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
            className
          )}
          role="tooltip"
        >
          {content}
          <TooltipArrow side={side} />
        </div>
      )}
    </>
  );
}

function TooltipArrow({ side }: { side: TooltipSide }) {
  const arrowClasses = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45",
    bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45",
    left: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45",
    right: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45",
  };

  return (
    <span
      className={cn(
        "absolute w-2 h-2 bg-surface-secondary border-border",
        arrowClasses[side]
      )}
      style={{
        borderWidth: side === "top" || side === "left" ? "0 1px 1px 0" : "1px 0 0 1px",
      }}
    />
  );
}

interface TooltipProviderProps {
  children: React.ReactNode;
}

export function TooltipProvider({
  children,
}: TooltipProviderProps) {
  return <>{children}</>;
}

export { type TooltipSide, type TooltipAlign };
