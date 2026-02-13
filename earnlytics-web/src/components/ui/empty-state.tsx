"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  BarChart3,
  Search,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  Inbox,
} from "lucide-react";

const iconMap = {
  chart: BarChart3,
  search: Search,
  file: FileText,
  company: Building2,
  calendar: Calendar,
  alert: AlertCircle,
  loading: Loader2,
  inbox: Inbox,
};

const iconBgColors = {
  chart: "bg-[#6366F1]/15",
  search: "bg-[#3B82F6]/15",
  file: "bg-[#A1A1AA]/15",
  company: "bg-[#22C55E]/15",
  calendar: "bg-[#F59E0B]/15",
  alert: "bg-[#EF4444]/15",
  loading: "bg-[#6366F1]/15",
  inbox: "bg-[#71717A]/15",
};

const iconColors = {
  chart: "text-primary",
  search: "text-info",
  file: "text-text-secondary",
  company: "text-success",
  calendar: "text-warning",
  alert: "text-error",
  loading: "text-primary",
  inbox: "text-text-tertiary",
};

export interface EmptyStateProps {
  icon?: keyof typeof iconMap;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const Icon = iconMap[icon];
  const isLoading = icon === "loading";

  const sizeClasses = {
    sm: {
      wrapper: "p-4",
      icon: "w-10 h-10",
      iconSize: 20,
      title: "text-base",
      description: "text-sm",
    },
    md: {
      wrapper: "p-8",
      icon: "w-14 h-14",
      iconSize: 28,
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      wrapper: "p-12",
      icon: "w-20 h-20",
      iconSize: 40,
      title: "text-xl",
      description: "text-base",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-border bg-surface",
        classes.wrapper,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full mb-4",
          iconBgColors[icon],
          classes.icon
        )}
      >
        <Icon
          className={cn(iconColors[icon], isLoading && "animate-spin")}
          size={classes.iconSize}
        />
      </div>

      <h3 className={cn("font-semibold text-white mb-2", classes.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-text-secondary max-w-sm mb-6", classes.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              className="text-text-secondary hover:text-white"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoDataState({
  title = "暂无数据",
  description = "当前没有可显示的数据",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon="inbox"
      title={title}
      description={description}
      className={className}
    />
  );
}

export function LoadingState({
  title = "加载中",
  description = "正在获取数据，请稍候...",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon="loading"
      title={title}
      description={description}
      className={className}
    />
  );
}

export function ErrorState({
  title = "出错了",
  description = "无法加载数据，请稍后重试",
  onRetryAction,
  className,
}: {
  title?: string;
  description?: string;
  onRetryAction?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon="alert"
      title={title}
      description={description}
      action={
        onRetryAction
          ? {
              label: "重试",
              onClick: onRetryAction,
              variant: "default",
            }
          : undefined
      }
      className={className}
    />
  );
}

export function SearchEmptyState({
  query,
  onClearAction,
  className,
}: {
  query?: string;
  onClearAction?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon="search"
      title={query ? `未找到 "${query}" 相关结果` : "请输入搜索关键词"}
      description={
        query
          ? "尝试使用不同的关键词或检查拼写"
          : "输入公司名称或股票代码开始搜索"
      }
      action={
        onClearAction && query
          ? {
              label: "清除搜索",
              onClick: onClearAction,
              variant: "outline",
            }
          : undefined
      }
      className={className}
    />
  );
}

export function ChartEmptyState({
  title = "暂无图表数据",
  description = "数据加载完成后将显示图表",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon="chart"
      title={title}
      description={description}
      className={className}
    />
  );
}

export function CompanyEmptyState({
  title = "暂无公司信息",
  description = "该公司信息尚未收录或暂时无法访问",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon="company"
      title={title}
      description={description}
      className={className}
    />
  );
}

export function CalendarEmptyState({
  title = "暂无日程",
  description = "该日期范围内没有财报发布",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon="calendar"
      title={title}
      description={description}
      className={className}
    />
  );
}

export default EmptyState;
