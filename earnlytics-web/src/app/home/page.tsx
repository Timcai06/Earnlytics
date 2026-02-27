import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import HomePageClient from "./HomePageClient";
import { fetchHomePageData, type HomePageDataResult } from "./home-data";

export const metadata: Metadata = {
  title: "金融指挥中心 - Earnlytics | AI财报分析",
  description: "实时洞察30+科技公司财报，AI驱动的投资分析平台。查看最新财报、财报日历和AI分析。",
  keywords: ["财报分析", "美股财报", "AI投资", "科技股", "财报日历", "投资分析"],
};

export const revalidate = 300;

const getCachedHomePageData = unstable_cache(
  async (): Promise<HomePageDataResult> => fetchHomePageData(),
  ["home-page-data-v1"],
  { revalidate: 300 }
);

export default async function HomePage() {
  let initialData: HomePageDataResult | null = null;
  try {
    initialData = await getCachedHomePageData();
  } catch {
    initialData = null;
  }
  return <HomePageClient initialData={initialData} />;
}
