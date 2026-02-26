"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import RightSidebar from "@/components/layout/RightSidebar";
import Footer from "@/components/layout/Footer";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import TopLoadingBar from "@/components/ui/TopLoadingBar";
import { Suspense } from "react";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <PerformanceMonitor />
      <Suspense fallback={null}>
        <TopLoadingBar />
      </Suspense>
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />
      <RightSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 pt-[87px]">{children}</main>
      <Footer />
    </>
  );
}
