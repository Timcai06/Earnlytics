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
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Always hidden by default, slides in when opened */}
      <aside className={`fixed right-0 top-[87px] z-50 h-[calc(100vh-87px)] w-64 flex-col border-l border-border bg-surface transition-transform duration-300 ${
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
                      ? "bg-primary text-white shadow-[var(--shadow-toggle-button)]"
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
    </>
  );
}