"use client";

import Link from "next/link";
import { BarChart3, Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-40 h-[87px] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Earnlytics</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              {user.name || "个人主页"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
            >
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
