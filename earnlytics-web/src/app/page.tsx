import type { Metadata } from "next";
import LandingPageUI from "@/components/home/LandingPageUI";

export const metadata: Metadata = {
  title: "Earnlytics - AI财报分析平台 | 1小时内获取投资洞察",
  description: "专业的AI财报分析平台，覆盖Apple、Microsoft、NVIDIA等30+科技公司。财报发布后1小时内生成深度分析，帮助投资者快速把握投资机会。",
  keywords: ["财报分析", "AI投资", "美股财报", "财务分析", "投资工具", "科技股分析", "Apple财报", "Microsoft财报", "NVIDIA财报"],
  openGraph: {
    title: "Earnlytics - AI驱动的财报分析平台",
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

export default function Page() {
  return <LandingPageUI />;
}
