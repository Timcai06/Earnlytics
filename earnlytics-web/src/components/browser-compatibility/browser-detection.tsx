import { useEffect, useState } from "react";

interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
}

function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined") {
    return { name: "unknown", version: "unknown", isSupported: true };
  }

  const userAgent = navigator.userAgent;
  let name = "unknown";
  let version = "unknown";

  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
    name = "Chrome";
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    name = "Safari";
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("Firefox") > -1) {
    name = "Firefox";
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("Edg") > -1) {
    name = "Edge";
    version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "unknown";
  }

  const minVersions: Record<string, number> = {
    Chrome: 90,
    Firefox: 88,
    Safari: 14,
    Edge: 90,
  };

  const majorVersion = parseInt(version.split(".")[0]) || 0;
  const isSupported = minVersions[name] ? majorVersion >= minVersions[name] : true;

  return { name, version, isSupported };
}

export function useBrowserDetection(): BrowserInfo {
  const [browserInfo] = useState<BrowserInfo>(detectBrowser);
  return browserInfo;
}

export function BrowserCompatibilityWarning() {
  const browserInfo = useBrowserDetection();

  if (browserInfo.isSupported) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-900 p-3 text-center text-sm">
      <p>
        您正在使用 {browserInfo.name} {browserInfo.version}，为了获得最佳体验，
        请升级到最新版本的 Chrome、Firefox、Safari 或 Edge。
      </p>
    </div>
  );
}
