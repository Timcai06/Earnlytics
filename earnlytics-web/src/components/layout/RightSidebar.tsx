"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { Home, Building2, Calendar, LayoutDashboard, ArrowRight, Sparkles } from "lucide-react";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RightSidebar({ isOpen, onClose }: RightSidebarProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "首页", href: "/home", icon: Home, description: "回到主页" },
    { label: "公司", href: "/companies", icon: Building2, description: "浏览公司列表" },
    { label: "日历", href: "/calendar", icon: Calendar, description: "财报日历" },
    { label: "仪表盘", href: "/dashboard", icon: LayoutDashboard, description: "数据概览" },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // setTimeout(0) prevents the toggle button's click from immediately triggering close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label="导航菜单"
      className={`fixed right-4 top-[76px] z-50 w-72 origin-top-right transition-all duration-200 ease-out sm:right-6 lg:right-8 ${
        isOpen
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-surface/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <nav className="flex flex-col p-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ${
                  isActive
                    ? "bg-primary/15 text-white"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-white"
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 30}ms` : "0ms",
                }}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-secondary text-text-tertiary group-hover:bg-border group-hover:text-text-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {item.label}
                  </span>
                  <span className="text-xs leading-tight text-text-tertiary">
                    {item.description}
                  </span>
                </div>

                <ArrowRight
                  className={`ml-auto h-3.5 w-3.5 transition-all duration-150 ${
                    isActive
                      ? "text-primary opacity-100"
                      : "translate-x-0 text-text-tertiary opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-border" />

        <div className="p-2">
          <Link
            href="/signup"
            onClick={onClose}
            className="group flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25"
          >
            <Sparkles className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            免费订阅
          </Link>
        </div>
      </div>
    </div>
  );
}