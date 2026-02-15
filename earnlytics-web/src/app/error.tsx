"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-white">出现了一些问题</h2>
      <p className="mb-6 text-text-secondary">
        抱歉，页面加载时发生了错误。请稍后重试。
      </p>
      <Button
        onClick={() => reset()}
        className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
      >
        重新加载
      </Button>
    </div>
  );
}
