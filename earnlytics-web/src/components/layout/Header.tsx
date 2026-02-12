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
    { label: "仪表盘", href: "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 h-[87px] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-20">
        {/* Left Group: Logo + Nav */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F172A]">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Earnlytics</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[15px] font-medium leading-none transition-colors hover:text-white ${
                  pathname === item.href ? "text-white" : "text-text-secondary"
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
          className="rounded-lg border border-[#818CF8] bg-primary px-6 py-3 text-[15px] font-semibold leading-none text-white shadow-[0_0_24px_rgba(99,102,241,0.67)] transition-colors hover:bg-primary-hover"
        >
          免费订阅
        </Link>
      </div>
    </header>
  );
}
