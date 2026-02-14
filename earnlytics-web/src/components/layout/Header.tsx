"use client";

import Link from "next/link";
import { BarChart3, Menu, X } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export default function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-[87px] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Earnlytics</span>
        </Link>

        {/* Desktop CTA Button */}
        <div className="hidden lg:block">
          <Link
            href="/signup"
            className="rounded-lg border border-primary-hover bg-primary px-6 py-3 text-[15px] font-semibold leading-none text-white shadow-[0_0_24px_rgba(99,102,241,0.67)] transition-colors hover:bg-primary-hover"
          >
            免费订阅
          </Link>
        </div>

        {/* Menu Toggle Button - Shows on all screen sizes */}
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-white transition-colors hover:bg-surface-secondary"
          aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
