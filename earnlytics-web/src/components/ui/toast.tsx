"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const toastIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  default: "bg-surface border-border",
  success: "bg-surface border-success",
  error: "bg-surface border-error",
  warning: "bg-surface border-warning",
  info: "bg-surface border-info",
};

const iconColors = {
  default: "text-text-secondary",
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
};

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastWithId: Toast = { ...newToast, id };
    setToasts((prev) => [...prev, toastWithId]);

    if (newToast.duration !== 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration || 5000);
    }
  }, [dismiss]);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = toastIcons[toast.variant || "default"];
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDismiss]);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg",
        "transform transition-all duration-300 ease-out",
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0",
        toastStyles[toast.variant || "default"]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon
        className={cn("flex-shrink-0 mt-0.5", iconColors[toast.variant || "default"])}
        size={20}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white text-sm">{toast.title}</h4>
        {toast.description && (
          <p className="text-text-secondary text-sm mt-1">{toast.description}</p>
        )}
        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-8 px-2 text-primary hover:text-primary-hover hover:bg-primary/10"
            onClick={() => {
              toast.action?.onClick();
              handleDismiss();
            }}
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-lg text-text-tertiary hover:text-white hover:bg-surface-secondary transition-colors"
        aria-label="关闭通知"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="通知"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export { type Toast, type ToastVariant };
