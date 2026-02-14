"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import RightSidebar from "@/components/layout/RightSidebar";
import Footer from "@/components/layout/Footer";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <PerformanceMonitor />
      <Header 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMenuOpen={isSidebarOpen}
      />
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
