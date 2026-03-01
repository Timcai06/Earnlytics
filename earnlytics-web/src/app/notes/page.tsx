import type { Metadata } from "next";
import NotesPageClient from "./NotesPageClient";

export const metadata: Metadata = {
  title: "投资备忘录 - Earnlytics",
  description: "跨财报搜索并管理你的 AI 投资备忘录",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotesPage() {
  return <NotesPageClient />;
}
