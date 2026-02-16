"use client";

import Link from "next/link";
import { BarChart3, Menu, X, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      console.log("Header: 用户已登录", parsed);
      setUser(parsed);
    } else {
      console.log("Header: 用户未登录");
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-[87px] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Earnlytics</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="group flex items-center gap-2.5 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 transition-all duration-200 hover:border-primary/40 hover:bg-surface-secondary"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {(user.name || "U").charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-white">
                {user.name || "个人主页"}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-primary/40 hover:bg-surface-secondary hover:text-white"
            >
              <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              登录
            </Link>
          )}

          <button
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-white transition-colors hover:bg-surface-secondary"
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
