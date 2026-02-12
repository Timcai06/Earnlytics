"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const container = containerRef.current;
      if (container) {
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (firstElement) {
          firstElement.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key !== "Tab") return;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        };

        container.addEventListener("keydown", handleKeyDown);
        return () => {
          container.removeEventListener("keydown", handleKeyDown);
          previousActiveElement.current?.focus();
        };
      }
    }
  }, [active]);

  return containerRef;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean; alt?: boolean; shift?: boolean }
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { ctrl = false, alt = false, shift = false } = options || {};
      
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.altKey === alt &&
        e.shiftKey === shift
      ) {
        e.preventDefault();
        callback();
      }
    },
    [key, callback, options]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useArrowNavigation(
  itemSelector: string,
  onSelect: (index: number) => void,
  activeIndex: number
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = container.querySelectorAll(itemSelector);
      const maxIndex = items.length - 1;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          onSelect(Math.min(activeIndex + 1, maxIndex));
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          onSelect(Math.max(activeIndex - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          onSelect(0);
          break;
        case "End":
          e.preventDefault();
          onSelect(maxIndex);
          break;
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [itemSelector, onSelect, activeIndex]);

  return containerRef;
}

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}

export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6366F1] focus:text-white focus:rounded-lg"
    >
      {children}
    </a>
  );
}

export function GlobalShortcuts() {
  useKeyboardShortcut("k", () => {
    const searchInput = document.querySelector('[data-search="true"]') as HTMLElement;
    searchInput?.focus();
  });

  useKeyboardShortcut("h", () => {
    window.location.href = "/home";
  }, { ctrl: true });

  useKeyboardShortcut("c", () => {
    window.location.href = "/companies";
  }, { ctrl: true });

  useKeyboardShortcut("d", () => {
    window.location.href = "/dashboard";
  }, { ctrl: true });

  return null;
}
