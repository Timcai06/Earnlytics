import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "首页 - Earnlytics | AI财报分析平台",
  description: "实时查看美国科技公司财报动态，获取AI深度分析。覆盖Apple、Microsoft、NVIDIA等30+家公司，最新财报数据即时更新。",
  keywords: ["财报日历", "美股财报", "科技股动态", "AI分析", "投资工具", "财报发布时间"],
  openGraph: {
    title: "Earnlytics - 金融指挥中心",
    description: "实时洞察 • 深度分析 • 智能决策 | 覆盖30+科技公司财报",
    url: "https://earnlytics-ebon.vercel.app/home",
    siteName: "Earnlytics",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
