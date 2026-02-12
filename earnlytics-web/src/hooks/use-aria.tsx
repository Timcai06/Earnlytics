"use client";

import React, { useEffect, useState } from "react";

interface LiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
  clearAfter?: number;
}

export function useLiveRegion({ message, priority = "polite", clearAfter = 3000 }: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
    const timer = setTimeout(() => {
      setAnnouncement("");
    }, clearAfter);

    return () => clearTimeout(timer);
  }, [message, clearAfter]);

  return {
    liveRegionProps: {
      "aria-live": priority,
      "aria-atomic": true,
      className: "sr-only",
    },
    announcement,
  };
}

export function LiveRegion({ message, priority = "polite" }: Omit<LiveRegionProps, "clearAfter">) {
  const { liveRegionProps, announcement } = useLiveRegion({ message, priority });

  return <div {...liveRegionProps}>{announcement}</div>;
}

export function useAriaLabel(value: string | number | undefined, prefix?: string): string {
  if (value === undefined || value === null) return "";
  return prefix ? `${prefix}: ${value}` : String(value);
}

export function useAriaDescribedBy(...ids: (string | undefined)[]): string {
  return ids.filter(Boolean).join(" ");
}

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

export function DecorativeImage({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} aria-hidden="true" {...props} />;
}

export function AriaLabelledBy({ id, children }: { id: string; children: React.ReactNode }) {
  return <span id={id}>{children}</span>;
}

export function AriaDescribedBy({ id, children }: { id: string; children: React.ReactNode }) {
  return <span id={id}>{children}</span>;
}

export function ErrorMessage({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} role="alert" className="text-red-400 text-sm">
      {children}
    </span>
  );
}

export function RequiredFieldIndicator() {
  return (
    <span aria-hidden="true" className="text-red-400 ml-1">
      *
    </span>
  );
}

export function LoadingState({ message = "加载中" }: { message?: string }) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}

export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="text-emerald-400">
      {children}
    </div>
  );
}

export function AlertMessage({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="text-red-400">
      {children}
    </div>
  );
}

export function useAriaExpanded(expanded: boolean) {
  return {
    "aria-expanded": expanded,
  };
}

export function useAriaPressed(pressed: boolean) {
  return {
    "aria-pressed": pressed,
  };
}

export function useAriaSelected(selected: boolean) {
  return {
    "aria-selected": selected,
  };
}

export function useAriaHidden(hidden: boolean) {
  return {
    "aria-hidden": hidden,
  };
}

export function useAriaDisabled(disabled: boolean) {
  return {
    "aria-disabled": disabled,
  };
}

export function useAriaCurrent(current: boolean, type: "page" | "step" | "location" | "date" | "time" = "page") {
  return current ? { "aria-current": type } : {};
}

export function useAriaInvalid(invalid: boolean) {
  return {
    "aria-invalid": invalid,
  };
}

export function useAriaRequired(required: boolean) {
  return {
    "aria-required": required,
  };
}

export function useAriaBusy(busy: boolean) {
  return {
    "aria-busy": busy,
  };
}
