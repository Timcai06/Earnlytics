"use client";

import { useEffect } from "react";

interface AdsenseAdProps {
  adSlot: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdsenseAd({ adSlot }: AdsenseAdProps) {
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
      style={{ display: "block" }}
      data-ad-client="ca-pub-4998656796758497"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
