import type { Metadata } from "next";
import SignupPageClient from "./SignupPageClient";

export const metadata: Metadata = {
  title: "注册 - Earnlytics",
  description: "创建 Earnlytics 账户，开启您的AI财报分析之旅。",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
