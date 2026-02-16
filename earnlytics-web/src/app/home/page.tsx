import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "金融指挥中心 - Earnlytics | AI财报分析",
  description: "实时洞察30+科技公司财报，AI驱动的投资分析平台。查看最新财报、财报日历和AI分析。",
  keywords: ["财报分析", "美股财报", "AI投资", "科技股", "财报日历", "投资分析"],
};

export default function HomePage() {
  return <HomePageClient />;
}
