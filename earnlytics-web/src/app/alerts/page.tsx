import type { Metadata } from "next";
import AlertsPageClient from "./AlertsPageClient";

export const metadata: Metadata = {
  title: "预警中心 - Earnlytics",
  description: "管理财报与估值预警规则、查看预警历史并配置通知偏好。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AlertsPage() {
  return <AlertsPageClient />;
}

