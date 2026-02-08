"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3 } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "首页", href: "/home" },
    { label: "公司", href: "/companies" },
    { label: "日历", href: "/calendar" },
    { label: "分析", href: "/analysis" },
  ];

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-white">
      <div className="flex h-full items-center justify-between px-20">
        {/* Left Group: Logo + Nav */}
        <div className="flex items-center gap-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Earnlytics</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[15px] font-medium transition-colors hover:text-slate-900 ${
                  pathname === item.href ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: CTA Button */}
        <Link
          href="/signup"
          className="rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          免费订阅
        </Link>
      </div>
    </header>
  );
}
