import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";
import { cookies } from "next/headers";
import { resolveSessionFromCookieHeader } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "个人中心 - Earnlytics",
  description: "管理您的账户信息、订阅和通知偏好设置。",
};

function buildCookieHeader() {
  return cookies()
    .then((store) => store.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; "))
    .catch(() => "");
}

export default async function ProfilePage() {
  const cookieHeader = await buildCookieHeader();
  const resolved = await resolveSessionFromCookieHeader(cookieHeader || null);

  if (!resolved.appUser) {
    return <ProfilePageClient />;
  }

  return (
    <ProfilePageClient
      initialUser={{
        id: resolved.appUser.id,
        email: resolved.appUser.email,
        name: resolved.appUser.name,
      }}
    />
  );
}
