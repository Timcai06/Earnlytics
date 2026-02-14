"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Calendar, LayoutDashboard, X } from "lucide-react";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RightSidebar({ isOpen, onClose }: RightSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "首页", href: "/home", icon: Home },
    { label: "公司", href: "/companies", icon: Building2 },
    { label: "日历", href: "/calendar", icon: Calendar },
    { label: "仪表盘", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed right-0 top-[87px] z-50 h-[calc(100vh-87px)] w-64 flex-col border-l border-border bg-surface transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex flex-col p-4">
          <div className="mb-6 flex items-center justify-between px-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              导航
            </h2>
            <button 
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CTA in Sidebar */}
        <div className="mt-auto p-4">
          <Link
            href="/signup"
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            免费订阅
          </Link>
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar - Slides from right */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Slide-out Panel */}
        <aside
          className={`fixed right-0 top-0 z-50 h-full w-72 transform border-l border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button */}
          <div className="flex h-[87px] items-center justify-between border-b border-border px-4">
            <span className="text-lg font-bold text-white">菜单</span>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-surface-secondary"
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col p-4">
            <h2 className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              导航
            </h2>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        : "text-text-secondary hover:bg-surface-secondary hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* CTA in Mobile Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link
              href="/signup"
              onClick={onClose}
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              免费订阅
            </Link>
          </div>
        </aside>
      </>
    </>
  );
}
