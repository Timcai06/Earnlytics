import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "个人资料 - Earnlytics",
  description: "管理您的Earnlytics账户设置、订阅和通知偏好。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
