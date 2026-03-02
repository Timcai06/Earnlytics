"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import RightSidebar from "@/components/layout/RightSidebar";
import Footer from "@/components/layout/Footer";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";
import TopLoadingBar from "@/components/ui/TopLoadingBar";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth/context";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <PerformanceMonitor />
      <WebVitalsReporter />
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
    </AuthProvider>
  );
}
