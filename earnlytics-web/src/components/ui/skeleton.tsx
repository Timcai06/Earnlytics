"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "bg-[#27272A] relative overflow-hidden",
  {
    variants: {
      variant: {
        text: "rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-lg",
        rounded: "rounded-xl",
      },
      animation: {
        pulse: "animate-pulse",
        wave: "",
        none: "",
      },
    },
    defaultVariants: {
      variant: "text",
      animation: "pulse",
    },
  }
);

const waveAnimationStyles = `
  @keyframes skeleton-wave {
    0% { transform: translateX(-100%); }
    50%, 100% { transform: translateX(100%); }
  }
  
  .skeleton-wave::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    animation: skeleton-wave 2s infinite;
  }
`;

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant,
  animation,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const combinedStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  return (
    <>
      <style>{waveAnimationStyles}</style>
      <div
        className={cn(
          skeletonVariants({ variant, animation }),
          animation === "wave" && "skeleton-wave",
          className
        )}
        style={combinedStyle}
        {...props}
      />
    </>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#27272A] bg-[#111111] p-5", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="90%" height={14} />
        <Skeleton variant="text" width="70%" height={14} />
      </div>
      <div className="mt-4 pt-4 border-t border-[#27272A]">
        <Skeleton variant="text" width="30%" height={12} />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#27272A] bg-[#111111] p-5", className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={80} height={12} />
      </div>
      <div className="flex gap-4 mb-4">
        <Skeleton variant="text" width={60} height={12} />
        <Skeleton variant="text" width={60} height={12} />
        <Skeleton variant="text" width={60} height={12} />
      </div>
      <div className="relative h-[200px] w-full">
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height={`${Math.random() * 60 + 20}%`}
              className="rounded-t-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      <Skeleton variant="rectangular" width={16} height={16} className="rounded" />
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1" style={{ flex: i === 0 ? 2 : 1 }}>
          <Skeleton variant="text" width={i === 0 ? "80%" : "60%"} height={14} />
        </div>
      ))}
      <div className="flex gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden", className)}>
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#27272A] bg-[#1A1A1A]">
        <Skeleton variant="rectangular" width={16} height={16} className="rounded" />
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1" style={{ flex: i === 0 ? 2 : 1 }}>
            <Skeleton variant="text" width="50%" height={14} />
          </div>
        ))}
        <div className="w-[72px]" />
      </div>
      <div className="px-4">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton
            key={i}
            columns={columns}
            className={i !== rows - 1 ? "border-b border-[#27272A]" : ""}
          />
        ))}
      </div>
    </div>
  );
}

export function EarningsListSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-[#27272A] bg-[#111111]"
        >
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton variant="text" width={60} height={18} />
              <Skeleton variant="text" width={80} height={14} />
            </div>
            <Skeleton variant="text" width="40%" height={12} />
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-right">
              <Skeleton variant="text" width={60} height={16} />
              <Skeleton variant="text" width={40} height={12} className="ml-auto" />
            </div>
            <div className="text-right">
              <Skeleton variant="text" width={50} height={16} />
              <Skeleton variant="text" width={30} height={12} className="ml-auto" />
            </div>
          </div>
          <Skeleton variant="text" width={80} height={32} className="rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CompanyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#27272A] bg-[#111111] p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={44} height={44} />
          <div>
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={60} height={14} />
          </div>
        </div>
        <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="85%" height={14} />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton variant="text" width={70} height={24} className="rounded-full" />
        <Skeleton variant="text" width={80} height={24} className="rounded-full" />
        <Skeleton variant="text" width={60} height={24} className="rounded-full" />
      </div>
      <div className="pt-4 border-t border-[#27272A] flex items-center justify-between">
        <Skeleton variant="text" width={100} height={14} />
        <Skeleton variant="text" width={80} height={32} className="rounded-lg" />
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#27272A] bg-[#111111] p-5", className)}>
      <div className="flex items-start justify-between mb-2">
        <Skeleton variant="text" width={100} height={14} />
        <Skeleton variant="circular" width={20} height={20} />
      </div>
      <Skeleton variant="text" width={120} height={36} className="mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" width={50} height={20} className="rounded-full" />
        <Skeleton variant="text" width={80} height={12} />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-8", className)}>
      <Skeleton variant="text" width={200} height={32} className="mb-2" />
      <Skeleton variant="text" width={300} height={16} />
    </div>
  );
}

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}

export default Skeleton;
