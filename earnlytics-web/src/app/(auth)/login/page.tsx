import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "登录 - Earnlytics",
  description: "登录您的 Earnlytics 账户，继续您的财报分析之旅。",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
