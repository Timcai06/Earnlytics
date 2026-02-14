import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

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
    VariantProps<typeof spinnerVariants> {}

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
  message = "加载中...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingState size="lg" variant="primary">
        {message}
      </LoadingState>
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
      <Spinner size="md" variant="primary" />
    </div>
  );
}

export default Spinner;
