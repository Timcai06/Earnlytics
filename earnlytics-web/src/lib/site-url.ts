const FALLBACK_SITE_URL = "https://earnlytics-ebon.vercel.app";

function normalizeUrl(url: string): string {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeUrl(configured);
  }

  return FALLBACK_SITE_URL;
}
