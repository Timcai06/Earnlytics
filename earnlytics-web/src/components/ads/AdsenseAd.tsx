"use client";

import { useEffect } from "react";

interface AdsenseAdProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdsenseAd({ 
  adSlot, 
  adFormat = "auto" 
}: AdsenseAdProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle my-8 block mx-auto"
      style={{ display: "block", minHeight: "250px" }}
      data-ad-client="ca-pub-4998656796758497"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}
