import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "个人中心 - Earnlytics",
  description: "管理您的账户信息、订阅和通知偏好设置。",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
