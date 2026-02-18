"use client";

import Link from "next/link";
import { BarChart3, Menu, X, LogIn, User as UserIcon, LayoutDashboard, LogOut, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
        <Link href="/" className="group flex items-center gap-3 outline-none">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <BarChart3 className="h-5 w-5 text-text-secondary transition-colors duration-500 group-hover:text-white" />

            {/* Subtle inner glow for the icon */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent transition-all duration-500 group-hover:from-white group-hover:to-primary">
            Earnlytics
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/portfolio"
                className="relative group flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              >
                <Wallet className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-text-secondary group-hover:text-white">
                  持仓
                </span>
              </Link>
              <Link
              href="/profile"
              className="relative group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-1 transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            >
              <div className="relative">
                {/* Animated Ring around Avatar */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary via-info to-primary opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-40 animate-spin-slow" />

                {/* Avatar */}
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-surface-elevated to-surface-secondary shadow-inner ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                  <UserIcon className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
              </div>

              <div className="flex flex-col pr-3">
                <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary group-hover:text-primary transition-colors">
                  Investigator
                </span>
                <span className="text-sm font-bold text-white leading-tight">
                  {user.name || "User"}
                </span>
              </div>
              </Link>
            </div>
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
            className={cn(
              "relative group flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-500",
              isMenuOpen
                ? "border-primary/50 bg-primary/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                : "border-white/5 bg-white/5 text-text-secondary hover:border-primary/30 hover:bg-white/[0.08] hover:text-white"
            )}
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {/* Animated Ring on Hover */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary via-info to-primary opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-40 animate-spin-slow" />

            {/* Inner Glow Background */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex items-center justify-center">
              {isMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-300" />
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
