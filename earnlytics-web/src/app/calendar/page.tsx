import type { Metadata } from "next";
import CalendarClient from "./CalendarClient";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "财报日历 - Earnlytics | 即将发布的财报",
  description: "查看美国科技公司财报发布时间表。了解Apple、Microsoft、NVIDIA等公司即将发布的财报日期，提前把握投资机会。",
  keywords: ["财报日历", "财报发布时间", "美股财报日历", "财报发布日期", "Q1财报", "Q2财报", "Q3财报", "Q4财报"],
  openGraph: {
    title: "财报日历 - Earnlytics",
    description: "美国科技公司财报发布时间表",
    url: `${siteUrl}/calendar`,
    siteName: "Earnlytics",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CalendarPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  return <CalendarClient initialYear={year} initialMonth={month} />
}
