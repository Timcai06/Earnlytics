"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { TrendingUpIcon } from "@/components/icons";

const spinnerVariants = cva(
  "animate-spin rounded-full border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-10 w-10 border-2",
        xl: "h-12 w-12 border-3",
      },
      variant: {
        default: "border-primary",
        primary: "border-primary",
        secondary: "border-text-secondary",
        white: "border-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof spinnerVariants> { }

export function Spinner({
  className,
  size,
  variant,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export function LoadingState({
  children,
  className,
  size = "lg",
  variant = "primary",
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "white";
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Spinner size={size} variant={variant} />
      {children && (
        <p className="mt-4 text-text-secondary">{children}</p>
      )}
    </div>
  );
}

export function PageLoading({
  message = "正在准备您的投资洞察...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      <div className="relative flex flex-col items-center">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 bg-primary/20 blur-[60px] rounded-full animate-pulse" />

        {/* Logo Animation */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 mb-8 flex items-center justify-center h-20 w-20 rounded-2xl bg-surface-secondary border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <TrendingUpIcon className="h-10 w-10 text-primary" />
        </motion.div>

        {/* Loading Bar */}
        <div className="relative h-1 w-48 overflow-hidden rounded-full bg-white/5 mb-4">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium tracking-widest text-text-tertiary uppercase"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}

export function SectionLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute h-10 w-10 bg-primary/10 blur-xl rounded-full" />
        <Spinner size="md" variant="primary" />
      </div>
    </div>
  );
}

export default Spinner;
