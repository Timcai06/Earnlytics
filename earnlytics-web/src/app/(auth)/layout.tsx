import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "账户 - Earnlytics",
  description: "Earnlytics账户登录和注册",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
