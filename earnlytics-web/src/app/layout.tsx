import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import Script from "next/script";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Earnlytics - AI财报分析 | 1小时内获取投资洞察",
  description: "专业的AI财报分析平台，覆盖Apple、Microsoft等30+科技公司。财报发布后1小时内生成深度分析，帮助投资者快速把握机会。",
  keywords: ["财报分析", "AI投资", "美股财报", "财务分析", "投资工具", "科技股", " earnings analysis", "AI finance"],
  authors: [{ name: "Earnlytics" }],
  creator: "Earnlytics",
  openGraph: {
    title: "Earnlytics - AI财报分析平台",
    description: "1小时内获取专业财报分析，覆盖30+科技公司",
    url: "https://earnlytics-ebon.vercel.app",
    siteName: "Earnlytics",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earnlytics - AI财报分析",
    description: "专业的AI财报分析平台，1小时获取投资洞察",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4998656796758497"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
